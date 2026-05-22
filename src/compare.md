# Compare Module

The `compare` and `matrix` modules provide utilities for comparing cron expressions against each other.

## compare.js

### `fieldsEqual(a, b)`
Returns `true` if two field strings are semantically equivalent (order-insensitive for comma-separated values).

```js
import { fieldsEqual } from './compare.js';
fieldsEqual('1,2,3', '3,1,2'); // true
```

### `compareExpressions(exprA, exprB)`
Compares two cron expressions field by field. Returns an object:
```js
{
  equal: boolean,
  differences: [{ field: string, a: string, b: string }]
}
```

```js
import { compareExpressions } from './compare.js';
const result = compareExpressions('0 9 * * 1', '0 10 * * 1');
// { equal: false, differences: [{ field: 'hour', a: '9', b: '10' }] }
```

### `compareSummary(exprA, exprB)`
Returns a human-readable string summarizing the comparison.

```js
import { compareSummary } from './compare.js';
console.log(compareSummary('0 9 * * 1', '0 10 * * 1'));
// Expressions differ in 1 field(s):
//   hour: "9" → "10"
// A: At 09:00 on Monday
// B: At 10:00 on Monday
```

---

## matrix.js

### `buildMatrix(expressions)`
Builds a pairwise equivalence matrix for an array of cron expressions.

```js
import { buildMatrix } from './matrix.js';
const { labels, matrix } = buildMatrix(['0 9 * * 1', '0 9 * * 1', '0 10 * * 1']);
// matrix[0][1] === true  (first two are equivalent)
// matrix[0][2] === false
```

### `findEquivalentGroups(expressions)`
Groups equivalent expressions together.

```js
import { findEquivalentGroups } from './matrix.js';
const groups = findEquivalentGroups(['0 9 * * 1', '0 9 * * 1', '0 10 * * 1']);
// [ ['0 9 * * 1', '0 9 * * 1'], ['0 10 * * 1'] ]
```
