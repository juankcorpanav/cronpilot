# Pipeline

Chain multiple cronpilot operations into a single workflow.

## API

### `runPipeline(expression, steps?)`

Runs the given steps against a cron expression and returns a combined result.

```js
const { runPipeline } = require('./pipeline');

const result = runPipeline('0 9 * * 1-5', ['humanize', 'score', 'lint']);
console.log(result.results.human);  // "At 09:00, Monday through Friday"
console.log(result.results.score);  // { total: 85, ... }
```

### `fullReport(expression)`

Runs all available steps and returns a complete report.

```js
const { fullReport } = require('./pipeline');
const report = fullReport('*/15 * * * *');
```

### `listSteps()`

Returns the names of all built-in pipeline steps.

```js
const { listSteps } = require('./pipeline');
console.log(listSteps());
// ['parse', 'humanize', 'normalize', 'lint', 'score', 'classify']
```

## CLI

```bash
node pipeline.cli.js "0 9 * * 1-5"
node pipeline.cli.js "0 9 * * 1-5" humanize,score
node pipeline.cli.js --help
```

## Available Steps

| Step | Output Key | Description |
|------|-----------|-------------|
| `parse` | `parsed` | Parsed field structure |
| `humanize` | `human` | Human-readable description |
| `normalize` | `normalized` | Canonical expression |
| `lint` | `lint` | Lint warnings/errors |
| `score` | `score` | Readability/safety score |
| `classify` | `classification` | Frequency classification |
