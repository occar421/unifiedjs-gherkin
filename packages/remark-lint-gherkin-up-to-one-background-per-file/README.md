# remark-lint-gherkin-up-to-one-background-per-file

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-up-to-one-background-per-file.svg)](https://www.npmjs.com/package/remark-lint-gherkin-up-to-one-background-per-file)

[`remark-lint`](https://github.com/remarkjs/remark-lint) plugin to enforce up to one background per file in Gherkin files.

## Install

```bash
npm install remark-lint-gherkin-up-to-one-background-per-file
```

## Use

```javascript
import { read } from "to-vfile";
import { reporter } from "vfile-reporter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinUpToOneBackgroundPerFile from "remark-lint-gherkin-up-to-one-background-per-file";
import remarkStringify from "remark-stringify";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinUpToOneBackgroundPerFile)
  .use(remarkStringify)
  .process(await read("example.feature"));

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

```markdown
# Feature: Test

## Background:

- Given a step

## Background:

- Given another step
```

### Examples of Correct Code

```markdown
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
