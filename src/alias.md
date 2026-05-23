# Alias Module

The `alias` module lets you save, retrieve, and resolve human-friendly names for cron expressions.

## API

### `saveAlias(name, expression, description?)`
Save a named alias for a cron expression.

```js
const { saveAlias } = require('./alias');
saveAlias('daily', '0 0 * * *', 'Every day at midnight');
// => { name: 'daily', expression: '0 0 * * *', description: '...', createdAt: '...' }
```

### `getAlias(name)`
Retrieve a full alias object by name. Returns `null` if not found.

### `resolveAlias(name)`
Resolve a name to its cron expression string. Returns `null` if not found.

```js
resolveAlias('daily'); // => '0 0 * * *'
```

### `listAliases()`
Return an array of all saved alias objects.

### `removeAlias(name)`
Delete an alias by name. Returns `true` if removed, `false` if not found.

### `clearAliases()`
Remove all saved aliases.

### `findByExpression(expression)`
Find all aliases whose expression matches the given cron string.

```js
findByExpression('0 0 * * *');
// => [{ name: 'daily', expression: '0 0 * * *', ... }]
```

## Use Cases

- Give memorable names to frequently-used schedules
- Look up a schedule by name instead of memorizing cron syntax
- Find all aliases pointing to the same expression
- Integrate with the `history` or `favorites` modules for richer UX
