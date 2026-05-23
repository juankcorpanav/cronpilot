# annotate

Attach and manage human-readable annotations on cron expressions.

## API

### `annotate(expression, note)`

Add or update a plain-text annotation for a cron expression.

```js
const { annotate } = require('./annotate');
const entry = annotate('0 9 * * 1-5', 'Weekday morning standup trigger');
// { expression: '0 9 * * 1-5', note: 'Weekday morning standup trigger', updatedAt: '...' }
```

### `getAnnotation(expression)`

Retrieve the annotation for an expression, or `null` if none exists.

```js
getAnnotation('0 9 * * 1-5');
// { expression: '0 9 * * 1-5', note: '...', updatedAt: '...' }
```

### `removeAnnotation(expression)`

Delete an annotation. Returns `true` if removed, `false` if not found.

```js
removeAnnotation('0 9 * * 1-5'); // true
```

### `listAnnotations()`

Return all stored annotations as an array.

```js
listAnnotations();
// [ { expression, note, updatedAt }, ... ]
```

### `searchAnnotations(query)`

Case-insensitive full-text search across annotation notes.

```js
searchAnnotations('billing');
// [ { expression: '0 0 1 * *', note: 'Monthly billing job', ... } ]
```

### `clearAnnotations()`

Remove all stored annotations (useful for testing or reset flows).

## Notes

- Annotations are stored in-memory; integrate with `history.js` or `favorites.js`
  to persist alongside saved expressions.
- Expression keys are trimmed before storage and lookup.
- `updatedAt` is set to the ISO timestamp of the last write.
