const { watch, update, unwatch, getWatcher, listWatchers, clearWatchers } = require('./watch');

beforeEach(() => clearWatchers());

describe('watch', () => {
  test('registers a watcher and returns metadata', () => {
    const result = watch('job1', '0 * * * *', () => {});
    expect(result.id).toBe('job1');
    expect(result.expression).toBe('0 * * * *');
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  test('throws if name is empty', () => {
    expect(() => watch('', '0 * * * *', () => {})).toThrow('non-empty string');
  });

  test('throws if callback is not a function', () => {
    expect(() => watch('job1', '0 * * * *', null)).toThrow('function');
  });
});

describe('update', () => {
  test('triggers callback with new and old expression', () => {
    const calls = [];
    watch('job1', '0 * * * *', (n, o, id) => calls.push({ n, o, id }));
    const changed = update('job1', '30 * * * *');
    expect(changed).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({ n: '30 * * * *', o: '0 * * * *', id: 'job1' });
  });

  test('returns false when expression is unchanged', () => {
    const cb = jest.fn();
    watch('job2', '0 * * * *', cb);
    const changed = update('job2', '0 * * * *');
    expect(changed).toBe(false);
    expect(cb).not.toHaveBeenCalled();
  });

  test('throws if watcher does not exist', () => {
    expect(() => update('ghost', '0 * * * *')).toThrow('No watcher found');
  });
});

describe('unwatch', () => {
  test('removes an existing watcher', () => {
    watch('job3', '0 * * * *', () => {});
    expect(unwatch('job3')).toBe(true);
    expect(getWatcher('job3')).toBeNull();
  });

  test('returns false for unknown watcher', () => {
    expect(unwatch('nobody')).toBe(false);
  });
});

describe('getWatcher', () => {
  test('returns watcher info', () => {
    watch('job4', '*/5 * * * *', () => {});
    const w = getWatcher('job4');
    expect(w.id).toBe('job4');
    expect(w.expression).toBe('*/5 * * * *');
  });

  test('returns null for missing watcher', () => {
    expect(getWatcher('nope')).toBeNull();
  });
});

describe('listWatchers', () => {
  test('lists all active watchers', () => {
    watch('a', '0 1 * * *', () => {});
    watch('b', '0 2 * * *', () => {});
    const list = listWatchers();
    expect(list).toHaveLength(2);
    expect(list.map(w => w.id)).toEqual(expect.arrayContaining(['a', 'b']));
  });

  test('returns empty array when no watchers', () => {
    expect(listWatchers()).toEqual([]);
  });
});
