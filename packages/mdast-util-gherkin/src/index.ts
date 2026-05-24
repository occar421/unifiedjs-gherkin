import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type { Options as ToMarkdownExtension } from "mdast-util-to-markdown";
import "./augmentation.ts";
import gherkinTransform from "./gherkinTransform.ts";
import joins from "./gherkinJoins.ts";

export function gherkinFromMarkdown(): FromMarkdownExtension {
  return {
    transforms: [gherkinTransform],
  };
}

export function gherkinToMarkdown(_options: {} = {}): ToMarkdownExtension {
  return {
    join: joins,
  };
}
