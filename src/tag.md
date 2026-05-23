# Tag Module

The `tag` module lets you attach labels (tags) to cron expressions for organization, filtering, and search.

## API

### `addTags(expression, tags)`

Attach one or more tags to a cron expression. Tags are normalized to lowercase and deduplicated.

```js
const { addTags } = require('./tag');
addTags('0 9 * * 1-5', ['work', 'morning']);
// => ['work', 'morning']
```

### `getTags(expression)`

Retrieve all tags for a given expression.

```js
getTags('0 9 * * 1-5');
// => ['work', 'morning']
```

### `removeTag(expression, tag)`

Remove a specific tag from an expression.

```js
removeTag('0 9 * * 1-5', 'morning');
// => ['work']
```

### `findByTag(tag)`

Find all expressions that have a specific tag.

```js
findByTag('work');
// => ['0 9 * * 1-5', '0 17 * * 1-5']
```

### `listAllTags()`

List every unique tag across all tracked expressions, sorted alphabetically.

```js
listAllTags();
// => ['daily', 'morning', 'work']
```

### `clearTags(expression)`

Remove all tags associated with an expression.

```js
clearTags('0 9 * * 1-5');
```

## Notes

- Tags are stored in-memory. For persistence, serialize with `JSON.stringify` and restore with `addTags`.
- Tags are case-insensitive; `'Work'` and `'work'` are treated as the same tag.
- Complements the `favorites` and `history` modules for full expression lifecycle management.
