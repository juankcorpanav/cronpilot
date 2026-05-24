/**
 * Integration tests for audit CLI
 */

const { run } = require('./audit.cli');
const { clearAuditLog, getAuditLog } = require('./audit');

beforeEach(() => clearAuditLog());

function captureOutput(fn) {
  const logs = [];
  const errors = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => errors.push(a.join(' '));
  fn();
  console.log = origLog;
  console.error = origErr;
  return { logs, errors };
}

test('add command records an event', () => {
  const { logs } = captureOutput(() =>
    run(['node', 'audit.cli.js', 'add', '0 * * * *', 'created'])
  );
  expect(logs[0]).toContain('Recorded');
  expect(getAuditLog()).toHaveLength(1);
});

test('log command shows entries', () => {
  run(['node', 'audit.cli.js', 'add', '0 * * * *', 'validated']);
  const { logs } = captureOutput(() =>
    run(['node', 'audit.cli.js', 'log'])
  );
  expect(logs.some(l => l.includes('validated'))).toBe(true);
});

test('log command with --type filter', () => {
  run(['node', 'audit.cli.js', 'add', '0 * * * *', 'created']);
  run(['node', 'audit.cli.js', 'add', '0 * * * *', 'exported']);
  const { logs } = captureOutput(() =>
    run(['node', 'audit.cli.js', 'log', '--type', 'created'])
  );
  expect(logs).toHaveLength(1);
  expect(logs[0]).toContain('created');
});

test('summary command outputs counts', () => {
  run(['node', 'audit.cli.js', 'add', '0 * * * *', 'created']);
  run(['node', 'audit.cli.js', 'add', '0 * * * *', 'validated']);
  const { logs } = captureOutput(() =>
    run(['node', 'audit.cli.js', 'summary', '0 * * * *'])
  );
  const parsed = JSON.parse(logs.join(''));
  expect(parsed.total).toBe(2);
});

test('expressions command lists unique expressions', () => {
  run(['node', 'audit.cli.js', 'add', '0 * * * *', 'created']);
  run(['node', 'audit.cli.js', 'add', '*/5 * * * *', 'created']);
  const { logs } = captureOutput(() =>
    run(['node', 'audit.cli.js', 'expressions'])
  );
  expect(logs).toHaveLength(2);
});

test('clear command empties the log', () => {
  run(['node', 'audit.cli.js', 'add', '0 * * * *', 'created']);
  run(['node', 'audit.cli.js', 'clear']);
  expect(getAuditLog()).toHaveLength(0);
});

test('unknown command sets exitCode', () => {
  const prev = process.exitCode;
  process.exitCode = 0;
  captureOutput(() => run(['node', 'audit.cli.js', 'bogus']));
  expect(process.exitCode).toBe(1);
  process.exitCode = prev;
});

test('help command prints usage', () => {
  const { logs } = captureOutput(() => run(['node', 'audit.cli.js', 'help']));
  expect(logs.some(l => l.includes('Usage'))).toBe(true);
});
