/**
 * slot.js — Named time slot management for cron expressions
 * Allows saving expressions under descriptive slot names with metadata.
 */

const store = new Map();

function saveSlot(name, expression, meta = {}) {
  if (!name || typeof name !== 'string') throw new Error('Slot name must be a non-empty string');
  if (!expression || typeof expression !== 'string') throw new Error('Expression must be a non-empty string');
  const slot = {
    name,
    expression,
    description: meta.description || '',
    timezone: meta.timezone || 'UTC',
    createdAt: meta.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.set(name, slot);
  return slot;
}

function getSlot(name) {
  return store.get(name) || null;
}

function listSlots() {
  return Array.from(store.values());
}

function removeSlot(name) {
  return store.delete(name);
}

function clearSlots() {
  store.clear();
}

function updateSlot(name, updates = {}) {
  const existing = store.get(name);
  if (!existing) return null;
  const updated = { ...existing, ...updates, name, updatedAt: new Date().toISOString() };
  store.set(name, updated);
  return updated;
}

function findSlotByExpression(expression) {
  for (const slot of store.values()) {
    if (slot.expression === expression) return slot;
  }
  return null;
}

function slotExists(name) {
  return store.has(name);
}

module.exports = {
  saveSlot,
  getSlot,
  listSlots,
  removeSlot,
  clearSlots,
  updateSlot,
  findSlotByExpression,
  slotExists,
};
