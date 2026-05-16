import type { Literal } from "mdast";
import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type { Options as ToMarkdownExtension } from "mdast-util-to-markdown";
import gherkinTransform from "./gherkinTransform.ts";
import { GHERKIN_KEYWORD_TYPE } from "./constant.ts";

export interface GherkinKeyword extends Literal {
  type: typeof GHERKIN_KEYWORD_TYPE;
}

declare module "mdast" {
  interface PhrasingContentMap {
    gherkinKeyword: GherkinKeyword;
  }
}

export function gherkinFromMarkdown(): FromMarkdownExtension {
  return {
    transforms: [gherkinTransform],
  };
}

export function gherkinToMarkdown(_options: {} = {}): ToMarkdownExtension {
  return {};
}
