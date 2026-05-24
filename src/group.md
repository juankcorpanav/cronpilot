# Group

Organize cron expressions into named groups for easier management and bulk operations.

## API

### `addToGroup(name, expressions)`
Creates a group (or appends to an existing one) with the given cron expressions. Duplicates are ignored.

```js
const { addToGroup } = require('./group');
addToGroup('business-hours', ['0 9 * * 1-5', '0 17 * * 1-5']);
// => { name: 'business-hours', expressions: ['0 9 * * 1-5', '0 17 * * 1-5'], createdAt: '...', updatedAt: '...' }
```

### `getGroup(name)`
Returns the group object or `null` if not found.

```js
getGroup('business-hours');
// => { name: 'business-hours', expressions: [...], ... }
```

### `listGroups()`
Returns an array of all group names.

```js
listGroups(); // => ['business-hours', 'nightly']
```

### `removeFromGroup(name, expression)`
Removes a single expression from a group. Returns `true` on success, `false` otherwise.

### `deleteGroup(name)`
Deletes an entire group. Returns `true` on success, `false` if not found.

### `findGroupsByExpression(expression)`
Returns all group names that contain the given expression.

```js
findGroupsByExpression('0 9 * * 1-5'); // => ['business-hours']
```

### `mergeGroups(nameA, nameB, targetName)`
Merges two groups into a new group (deduplicating expressions). The source groups are preserved.

```js
mergeGroups('morning', 'evening', 'all-day');
```

## CLI

```bash
node src/group.cli.js add nightly "0 2 * * *" "0 3 * * *"
node src/group.cli.js get nightly
node src/group.cli.js list
node src/group.cli.js remove nightly "0 3 * * *"
node src/group.cli.js find "0 2 * * *"
node src/group.cli.js merge morning evening all-day
node src/group.cli.js delete nightly
```

## Notes
- Group data is stored in-memory; integrate with `snapshot.js` to persist groups across sessions.
- Use `findGroupsByExpression` in combination with `audit.js` to trace which groups triggered a scheduled job.
