const { run } = require('./slot.cli');
const { clearSlots } = require('./slot');

function captureOutput(fn) {
  const logs = [];
  const orig = console.log;
  console.log = (...a) => logs.push(a.join(' '));
  fn();
  console.log = orig;
  return logs;
}

beforeEach(() => clearSlots());

test('save and get a slot via CLI', () => {
  run(['save', 'morning', '0 8 * * *', 'Morning job', 'US/Eastern']);
  const out = captureOutput(() => run(['get', 'morning']));
  expect(out.join('\n')).toContain('morning');
  expect(out.join('\n')).toContain('0 8 * * *');
});

test('list shows all slots', () => {
  run(['save', 'a', '* * * * *']);
  run(['save', 'b', '0 0 * * *']);
  const out = captureOutput(() => run(['list']));
  expect(out.some(l => l.includes('a'))).toBe(true);
  expect(out.some(l => l.includes('b'))).toBe(true);
});

test('remove a slot via CLI', () => {
  run(['save', 'temp', '*/10 * * * *']);
  const out = captureOutput(() => run(['remove', 'temp']));
  expect(out[0]).toContain('Removed slot');
});

test('remove non-existent slot reports not found', () => {
  const out = captureOutput(() => run(['remove', 'ghost']));
  expect(out[0]).toContain('not found');
});

test('update a slot field via CLI', () => {
  run(['save', 'upd', '0 1 * * *', 'old desc']);
  const out = captureOutput(() => run(['update', 'upd', 'description', 'new desc']));
  expect(out[0]).toContain('Updated slot');
});

test('get non-existent slot reports not found', () => {
  const out = captureOutput(() => run(['get', 'missing']));
  expect(out[0]).toContain('No slot found');
});

test('list with no slots shows empty message', () => {
  const out = captureOutput(() => run(['list']));
  expect(out[0]).toContain('No slots saved');
});

test('unknown command shows usage hint', () => {
  const errs = [];
  const orig = console.error;
  console.error = (...a) => errs.push(a.join(' '));
  run(['bogus']);
  console.error = orig;
  expect(errs[0]).toContain('Unknown command');
});
