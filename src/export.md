# Export Module

The `export` module converts cron expressions into various portable formats for use in documentation, configuration files, and data interchange.

## Supported Formats

| Format     | Output Type | Use Case                          |
|------------|-------------|-----------------------------------|
| `json`     | Object      | API responses, data storage       |
| `yaml`     | String      | Config files, CI/CD pipelines     |
| `crontab`  | String      | Drop-in crontab entries           |
| `markdown` | String      | Documentation, README files       |

## API

### `exportExpression(expression, format, options)`

Generic dispatcher for all export formats.

```js
import { exportExpression } from './export.js';

exportExpression('0 9 * * 1-5', 'markdown', {
  label: 'Weekday Standup',
  timezone: 'America/New_York',
});
// => `0 9 * * 1-5`
// > At 09:00, Monday through Friday (America/New_York)
```

### `toJson(expression, meta)`

Returns a structured object with parsed fields, human-readable text, and metadata.

```js
toJson('*/5 * * * *', { label: 'Heartbeat', timezone: 'UTC' });
```

### `toYaml(expression, meta)`

Returns a YAML-formatted string suitable for embedding in config files.

```js
toYaml('0 0 * * *', { timezone: 'Europe/London' });
```

### `toCrontab(expression, command, meta)`

Returns a ready-to-paste crontab entry with an optional comment and `CRON_TZ` prefix.

```js
toCrontab('0 2 * * *', '/usr/bin/backup.sh', { timezone: 'Asia/Tokyo' });
// => # At 02:00
// => CRON_TZ=Asia/Tokyo 0 2 * * * /usr/bin/backup.sh
```

### `toMarkdown(expression, meta)`

Returns a Markdown snippet with the expression and human-readable summary.

```js
toMarkdown('0 12 * * 5', { label: 'Weekly Report', timezone: 'UTC' });
// => **Weekly Report**
// =>
// => `0 12 * * 5`
// =>
// => > At 12:00, only on Friday (UTC)
```

## Options

| Option        | Type   | Description                            |
|---------------|--------|----------------------------------------|
| `label`       | string | Human-friendly name for the schedule   |
| `timezone`    | string | IANA timezone string (e.g. `UTC`)      |
| `description` | string | Additional freeform description        |
| `command`     | string | Shell command for `crontab` format     |
