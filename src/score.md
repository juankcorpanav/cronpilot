# Score Module

The `score` module rates a cron expression across three dimensions and produces an overall quality score (0–100) with a letter grade.

## Dimensions

| Dimension     | Weight | Description |
|---------------|--------|-------------|
| Readability   | 40%    | How easy the expression is to understand at a glance |
| Specificity   | 35%    | How constrained / targeted the schedule is |
| Safety        | 25%    | How unlikely the expression is to cause runaway execution |

## Grades

| Score  | Grade |
|--------|-------|
| 90–100 | A     |
| 75–89  | B     |
| 60–74  | C     |
| 45–59  | D     |
| 0–44   | F     |

## API

### `scoreCron(expression)`

Returns a full scoring breakdown.

```js
const { scoreCron } = require('./score');

scoreCron('0 9 * * 1-5');
// {
//   total: 82,
//   readability: 87,
//   specificity: 82,
//   safety: 100,
//   grade: 'B',
//   warnings: []
// }
```

### `quickScore(expression)`

Returns just the numeric total score.

```js
const { quickScore } = require('./score');

quickScore('* * * * *'); // e.g. 28
quickScore('0 6 1 * *'); // e.g. 85
```

## Scoring Rules

**Readability penalties:**
- Each `*` wildcard: −5 pts
- Each step expression (`/`): −8 pts
- Long comma lists (>4 values): −10 pts
- Range expressions (`-`): −3 pts

**Specificity penalties:**
- Each wildcard field: −18 pts

**Safety penalties:**
- Minute is `*`: −40 pts
- Minute step < 5 (e.g. `*/2`): −20 pts
- Both minute and hour are `*`: additional −20 pts

## Notes

- Invalid expressions always receive a score of `0` and grade `F`.
- Warnings are surfaced from the `lint` module and included in the result.
