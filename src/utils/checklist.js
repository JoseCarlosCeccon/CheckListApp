const STORAGE_KEY = 'checklistapp.topicProgress.v1';

function hasLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

export function getTopicId(blockId, topicTitle) {
  return `${blockId}-topic-${hashString(`${blockId}|${topicTitle}`)}`;
}

export function getBlockTopicIds(block) {
  return block.topics.map((topic) => getTopicId(block.id, topic));
}

export function isBlockComplete(block, progress) {
  return getBlockTopicIds(block).every((topicId) => progress[topicId]);
}

export function countDoneTopics(blocks, progress) {
  return blocks.reduce(
    (total, block) =>
      total + getBlockTopicIds(block).filter((topicId) => progress[topicId]).length,
    0,
  );
}

export function countTopics(blocks) {
  return blocks.reduce((total, block) => total + block.topics.length, 0);
}

export function loadProgress() {
  if (!hasLocalStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress) {
  if (!hasLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore persistence failures so the UI remains usable.
  }
}

export function getCompletionPercent(done, total) {
  if (!total) {
    return 0;
  }

  return Math.round((done / total) * 100);
}
