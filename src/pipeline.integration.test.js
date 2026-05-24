const { run } = require('./pipeline.cli');

function captureOutput(fn) {
  const lines = [];
  const orig = console.log;
  console.log = (...args) => lines.push(args.join(' '));
  try { fn(); } finally { console.log = orig; }
  return lines;
}

describe('pipeline CLI integration', () => {
  it('prints usage with no args', () => {
    const out = captureOutput(() => run([]));
    expect(out.some(l => l.includes('Usage'))).toBe(true);
  });

  it('prints usage with --help', () => {
    const out = captureOutput(() => run(['--help']));
    expect(out.some(l => l.includes('Usage'))).toBe(true);
  });

  it('runs full pipeline and prints expression', () => {
    const out = captureOutput(() => run(['0 9 * * 1-5']));
    expect(out.some(l => l.includes('0 9 * * 1-5'))).toBe(true);
  });

  it('runs specific steps only', () => {
    const out = captureOutput(() => run(['*/5 * * * *', 'humanize,score']));
    expect(out.some(l => l.includes('human'))).toBe(true);
    expect(out.some(l => l.includes('score'))).toBe(true);
  });

  it('reports error for unknown step', () => {
    const out = captureOutput(() => run(['* * * * *', 'fakeStep']));
    expect(out.some(l => l.includes('fakeStep') || l.includes('Errors'))).toBe(true);
  });

  it('handles invalid expression without crashing', () => {
    expect(() => captureOutput(() => run(['not a cron']))).not.toThrow();
  });
});
