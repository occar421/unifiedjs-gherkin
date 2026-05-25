# remark-lint-gherkin-no-tags-on-backgrounds

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-tags-on-backgrounds.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-tags-on-backgrounds)

[`remark-lint`](https://github.com/remarkjs/remark-lint) plugin to disallow tags on backgrounds in Gherkin files.

## Install

```bash
npm install remark-lint-gherkin-no-tags-on-backgrounds
```

## Use

```javascript
import { read } from "to-vfile";
import { reporter } from "vfile-reporter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoTagsOnBackgrounds from "remark-lint-gherkin-no-tags-on-backgrounds";
import remarkStringify from "remark-stringify";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoTagsOnBackgrounds)
  .use(remarkStringify)
  .process(await read("example.feature"));

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

```markdown
# Feature: Test

`@tag`

## Background:

- Given a step
```

### Examples of Correct Code

```markdown
# Feature: Test

## Background:

- Given a step
```

```markdown
`@tag`

# Feature: Test

## Background:

- Given a step
```

## Development

- Install dependencies:

```bash
vp install
```

- Run the unit tests:

```bash
vp test
```

- Build the library:

```bash
vp pack
```
