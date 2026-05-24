# chain

Fluent builder for chaining multiple cron operations in a single pipeline.

## API

### `chain(expression)`

Creates a new `CronChain` instance for the given cron expression.

```js
const { chain } = require('./chain');

const result = chain('0 9 * * 1')
  .timezone('America/New_York')
  .validate()
  .describe()
  .score()
  .next(5)
  .result();
```

### Methods

| Method | Description |
|---|---|
| `.timezone(tz)` | Set the timezone context for subsequent operations |
| `.validate()` | Parse and validate the expression |
| `.normalize()` | Normalize the expression to a canonical form |
| `.describe()` | Generate a human-readable description |
| `.lint()` | Run lint checks and collect issues |
| `.score()` | Score the expression for readability, safety, and specificity |
| `.next(count)` | Compute the next N fire times using the current timezone |
| `.result()` | Return the final result object with all recorded steps |
| `.getStep(op)` | Retrieve the value of a specific step by operation name |

### Result shape

```js
{
  expression: '0 9 * * 1',
  timezone: 'America/New_York',
  steps: [
    { op: 'validate', value: { valid: true } },
    { op: 'describe', value: 'At 09:00 AM, only on Monday' },
    { op: 'score',    value: { total: 87, ... } },
    { op: 'next',     value: ['2024-06-03T13:00:00.000Z', ...] }
  ]
}
```

## CLI

```
node chain.cli.js "0 9 * * 1" --tz America/New_York --steps validate,describe,next --next-count 3
```
