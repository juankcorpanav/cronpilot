# cronpilot

> Human-readable cron expression builder and validator with timezone awareness

[![npm version](https://img.shields.io/npm/v/cronpilot)](https://www.npmjs.com/package/cronpilot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Installation

```bash
npm install cronpilot
```

---

## Usage

```javascript
import { CronPilot } from 'cronpilot';

const cron = new CronPilot({ timezone: 'America/New_York' });

// Build a cron expression using a human-readable API
const expression = cron
  .every('weekday')
  .at('09:30')
  .build();

console.log(expression);
// Output: "30 9 * * 1-5"

// Validate an existing cron expression
const result = cron.validate('30 9 * * 1-5');
console.log(result.isValid);   // true
console.log(result.describe()); // "At 09:30 AM, Monday through Friday, Eastern Time"

// Parse and describe any cron string
const description = CronPilot.describe('0 0 1 * *', 'UTC');
console.log(description); // "At 12:00 AM, on day 1 of the month, UTC"
```

---

## Features

- 🕐 Fluent, chainable API for building cron expressions
- ✅ Validates expressions and returns detailed error messages
- 🌍 Full timezone support via IANA timezone names
- 📖 Converts cron expressions into plain-English descriptions

---

## Contributing

Pull requests are welcome! Please open an issue first to discuss any major changes.

---

## License

[MIT](./LICENSE) © cronpilot contributors