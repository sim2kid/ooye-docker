import { env } from 'node:process';

const DOCKER_USERNAME = env.DOCKER_USERNAME;
const DOCKER_PASSWORD = env.DOCKER_PASSWORD;
const REPOSITORY = env.DOCKER_REPOSITORY || 'sim2kid/ooye-docker';

const KEEP_DAILY = parseInt(env.KEEP_DAILY || '7', 10);
const KEEP_WEEKLY = parseInt(env.KEEP_WEEKLY || '4', 10);
const KEEP_MONTHLY = parseInt(env.KEEP_MONTHLY || '12', 10);
const KEEP_YEARLY = parseInt(env.KEEP_YEARLY || '7', 10);

const DRY_RUN = env.DRY_RUN === 'true';

async function getAuthToken() {
  const response = await fetch('https://hub.docker.com/v2/users/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: DOCKER_USERNAME, password: DOCKER_PASSWORD }),
  });
  if (!response.ok) {
    throw new Error(`Failed to authenticate: ${response.statusText}`);
  }
  const data = await response.json();
  return data.token;
}

async function getAllTags(token) {
  let tags = [];
  let url = `https://hub.docker.com/v2/repositories/${REPOSITORY}/tags/?page_size=100`;
  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.statusText}`);
    }
    const data = await response.json();
    tags = tags.concat(data.results);
    url = data.next;
  }
  return tags;
}

async function deleteTag(token, tag) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Deleting tag: ${tag}`);
    return;
  }
  const response = await fetch(`https://hub.docker.com/v2/repositories/${REPOSITORY}/tags/${tag}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    console.error(`Failed to delete tag ${tag}: ${response.statusText}`);
  } else {
    console.log(`Deleted tag: ${tag}`);
  }
}

function isHashedTag(tag) {
  return /^[0-9a-f]{40}$/.test(tag);
}

function parseNightlyDate(tag) {
  const match = tag.match(/^nightly-(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  const dateStr = match[1];
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return { date, dateStr, tag };
}

function getIsoMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

async function main() {
  if (!DOCKER_USERNAME || !DOCKER_PASSWORD) {
    console.error('Error: DOCKER_USERNAME and DOCKER_PASSWORD must be set.');
    process.exit(1);
  }

  const token = await getAuthToken();
  const allTags = await getAllTags(token);

  const nightlyTags = allTags
    .map(t => parseNightlyDate(t.name))
    .filter(t => t !== null)
    .sort((a, b) => b.date - a.date);

  const tagsToKeep = new Set(['latest', 'nightly']);

  // Also keep any version tags (v*.*)
  allTags.forEach(t => {
    if (t.name.startsWith('v')) {
      tagsToKeep.add(t.name);
    }
  });

  // Daily policy: 7 most recent
  nightlyTags.slice(0, KEEP_DAILY).forEach(t => tagsToKeep.add(t.tag));

  // Weekly policy: 4 most recent Mondays
  let weeklyCount = 0;
  for (const t of nightlyTags) {
    if (t.date.getDay() === 1) { // 1 is Monday
      if (weeklyCount < KEEP_WEEKLY) {
        tagsToKeep.add(t.tag);
        weeklyCount++;
      }
    }
  }

  // Monthly policy: 12 most recent 1st of month
  let monthlyCount = 0;
  for (const t of nightlyTags) {
    if (t.date.getDate() === 1) { // 1 is 1st of month
      if (monthlyCount < KEEP_MONTHLY) {
        tagsToKeep.add(t.tag);
        monthlyCount++;
      }
    }
  }

  // Yearly policy: 7 most recent 1st of year (Jan 1)
  let yearlyCount = 0;
  for (const t of nightlyTags) {
    if (t.date.getDate() === 1 && t.date.getMonth() === 0) { // Jan 1
      if (yearlyCount < KEEP_YEARLY) {
        tagsToKeep.add(t.tag);
        yearlyCount++;
      }
    }
  }

  // Hashed tags policy: Only keep those connected to latest
  const latestTag = allTags.find(t => t.name === 'latest');
  if (latestTag) {
    // Docker Hub API returns digests in images array.
    // For simplicity, we'll collect all digests associated with 'latest'
    const latestDigests = new Set(latestTag.images.map(img => img.digest));

    for (const t of allTags) {
      if (isHashedTag(t.name)) {
        const isConnectedToLatest = t.images.some(img => latestDigests.has(img.digest));
        if (isConnectedToLatest) {
          tagsToKeep.add(t.name);
          console.log(`Keeping hashed tag ${t.name} (connected to latest)`);
        }
      }
    }
  }

  console.log(`Tags to keep: ${Array.from(tagsToKeep).join(', ')}`);

  const tagsToDelete = allTags
    .map(t => t.name)
    .filter(name => !tagsToKeep.has(name) && (parseNightlyDate(name) || isHashedTag(name)));

  if (tagsToDelete.length === 0) {
    console.log('No tags to delete.');
    return;
  }

  console.log(`Deleting ${tagsToDelete.length} tags: ${tagsToDelete.join(', ')}`);
  for (const tag of tagsToDelete) {
    await deleteTag(token, tag);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
