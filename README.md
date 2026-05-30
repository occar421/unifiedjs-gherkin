# Unified.js Gherkin

[unified](https://github.com/unifiedjs/unified) packages to support [Markdown with Gherkin (MDG)](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md) in [remark](https://github.com/remarkjs/remark).

## Packages

- [`remark-gherkin`](./packages/remark-gherkin): remark plugin.
- [`mdast-util-gherkin`](./packages/mdast-util-gherkin): mdast utility.
- `remark-lint-gherkin`: remark-lint plugin to disallow multiline steps in Gherkin files.
  - [`gherkin-lint`](https://github.com/gherkin-lint/gherkin-lint) equivalent
    - "no-multiline-steps" is excluded because of the difference of feature files and markdown files.

## Development

This project uses [Vite+](https://viteplus.dev/) for development.

### Setup

```bash
vp install
```

### Check & Test

```bash
vp run ready
```

Or run them separately:

```bash
vp check
vp run -r test
```

### Build

```bash
vp run -r build
```
