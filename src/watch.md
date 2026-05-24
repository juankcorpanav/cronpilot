# watch

Monitor cron expressions by name and react to changes via callbacks.

## API

### `watch(name, expression, callback)`

Registers a watcher for a named cron expression.

- `name` — Unique string identifier
- `expression` — Initial cron expression (e.g. `"0 * * * *"`)
- `callback(newExpr, oldExpr, name)` — Invoked whenever the expression changes

Returns `{ id, expression, createdAt }`.

### `update(name, newExpression)`

Updates the expression for an existing watcher. Fires the callback if the expression differs. Returns `true` if changed, `false` if unchanged. Throws if the watcher does not exist.

### `unwatch(name)`

Removes a watcher by name. Returns `true` if removed, `false` if not found.

### `getWatcher(name)`

Returns `{ id, expression, createdAt, updatedAt }` or `null`.

### `listWatchers()`

Returns an array of all active watcher metadata objects.

### `clearWatchers()`

Removes all registered watchers.

## CLI

```
node src/watch.cli.js watch daily "0 9 * * *"
node src/watch.cli.js update daily "0 10 * * *"
node src/watch.cli.js list
node src/watch.cli.js get daily
node src/watch.cli.js unwatch daily
node src/watch.cli.js clear
```

## Example

```js
const { watch, update } = require('./watch');

watch('report', '0 8 * * *', (next, prev, id) => {
  console.log(`${id} changed from ${prev} to ${next}`);
});

update('report', '0 9 * * *');
// → report changed from 0 8 * * * to 0 9 * * *
```
