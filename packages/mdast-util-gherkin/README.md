# mdast-util-gherkin

[![npm](https://img.shields.io/npm/v/mdast-util-gherkin.svg)](https://www.npmjs.com/package/mdast-util-gherkin)

[mdast](https://github.com/syntax-tree/mdast) extension to parse and serialize [Markdown with Gherkin (MDG)](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md).

## Install

```bash
npm install mdast-util-gherkin
```

## Use

### Parse

```javascript
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown } from "mdast-util-gherkin";

const doc = "# Feature: Eating cucumbers\n\n## Scenario: Eating\n\n* Given there are 12 cucumbers";
const tree = fromMarkdown(doc, {
  mdastExtensions: [gherkinFromMarkdown()],
});

console.log(tree);
```

### Serialize

```javascript
import { toMarkdown } from "mdast-util-to-markdown";
import { gherkinToMarkdown } from "mdast-util-gherkin";

const tree = {
  type: "root",
  children: [
    {
      type: "heading",
      depth: 1,
      children: [
        { type: "text", value: "Feature", data: { gherkin: { type: "segmentKeyword" } } },
        { type: "text", value: ":", data: { gherkin: { type: "segmentDelimiter" } } },
        { type: "text", value: " Eating cucumbers" },
      ],
    },
  ],
};

const out = toMarkdown(tree, {
  extensions: [gherkinToMarkdown()],
});

console.log(out);
```

## API

### `gherkinFromMarkdown()`

Returns an extension for `mdast-util-from-markdown` to enable Gherkin support in mdast.

### `gherkinToMarkdown(options?)`

Returns an extension for `mdast-util-to-markdown` to enable Gherkin support in markdown.

## Syntax

This extension supports the following Gherkin elements in Markdown:

- **Segment Keywords**: `Feature`, `Scenario`, `Background`, etc. in headings.
- **Step Keywords**: `Given`, `When`, `Then`, `And`, `But` in list items.
- **Tags**: `` `@tag` `` in paragraphs.
- **Parameters**: `<parameter>` in steps.

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
