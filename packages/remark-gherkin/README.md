# remark-gherkin

[![npm](https://img.shields.io/npm/v/remark-gherkin.svg)](https://www.npmjs.com/package/remark-gherkin)

[remark](https://github.com/remarkjs/remark) plugin to support [Markdown with Gherkin (MDG)](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md).

## Install

```bash
npm install remark-gherkin
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const doc = "# Feature: Eating cucumbers\n\n## Scenario: Eating\n\n* Given there are 12 cucumbers";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process(doc);

console.log(String(file));
```

## API

### `unified().use(remarkGherkin, options?)`

Configures remark to support Gherkin in Markdown.

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
