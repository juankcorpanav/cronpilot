const {
  saveSlot,
  getSlot,
  listSlots,
  removeSlot,
  clearSlots,
  updateSlot,
  findSlotByExpression,
  slotExists,
} = require('./slot');

beforeEach(() => clearSlots());

test('saveSlot stores a slot and returns it', () => {
  const slot = saveSlot('daily-backup', '0 2 * * *', { description: 'Nightly backup', timezone: 'America/New_York' });
  expect(slot.name).toBe('daily-backup');
  expect(slot.expression).toBe('0 2 * * *');
  expect(slot.description).toBe('Nightly backup');
  expect(slot.timezone).toBe('America/New_York');
  expect(slot.createdAt).toBeDefined();
});

test('getSlot retrieves a saved slot', () => {
  saveSlot('weekly', '0 9 * * 1');
  const slot = getSlot('weekly');
  expect(slot).not.toBeNull();
  expect(slot.expression).toBe('0 9 * * 1');
});

test('getSlot returns null for unknown name', () => {
  expect(getSlot('nonexistent')).toBeNull();
});

test('listSlots returns all saved slots', () => {
  saveSlot('a', '* * * * *');
  saveSlot('b', '0 0 * * *');
  expect(listSlots()).toHaveLength(2);
});

test('removeSlot deletes a slot', () => {
  saveSlot('temp', '*/5 * * * *');
  expect(removeSlot('temp')).toBe(true);
  expect(getSlot('temp')).toBeNull();
});

test('removeSlot returns false for unknown name', () => {
  expect(removeSlot('ghost')).toBe(false);
});

test('updateSlot modifies an existing slot', () => {
  saveSlot('patch', '0 1 * * *', { description: 'old' });
  const updated = updateSlot('patch', { description: 'new', timezone: 'Europe/London' });
  expect(updated.description).toBe('new');
  expect(updated.timezone).toBe('Europe/London');
  expect(updated.expression).toBe('0 1 * * *');
});

test('updateSlot returns null for unknown slot', () => {
  expect(updateSlot('missing', { description: 'x' })).toBeNull();
});

test('findSlotByExpression finds matching slot', () => {
  saveSlot('hourly', '0 * * * *');
  const found = findSlotByExpression('0 * * * *');
  expect(found).not.toBeNull();
  expect(found.name).toBe('hourly');
});

test('findSlotByExpression returns null if not found', () => {
  expect(findSlotByExpression('1 2 3 4 5')).toBeNull();
});

test('slotExists checks presence correctly', () => {
  saveSlot('check', '* * * * *');
  expect(slotExists('check')).toBe(true);
  expect(slotExists('nope')).toBe(false);
});

test('saveSlot throws on invalid name', () => {
  expect(() => saveSlot('', '* * * * *')).toThrow();
});

test('clearSlots empties the store', () => {
  saveSlot('x', '* * * * *');
  clearSlots();
  expect(listSlots()).toHaveLength(0);
});
