import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type { Handle, Options as ToMarkdownExtension } from "mdast-util-to-markdown";
import gherkinTransform from "./gherkinTransform.ts";
import { Types } from "./constant.ts";
import { findAfter } from "unist-util-find-after";

export function gherkinFromMarkdown(): FromMarkdownExtension {
  return {
    transforms: [gherkinTransform],
  };
}

export function gherkinToMarkdown(_options: {} = {}): ToMarkdownExtension {
  const customHandlers: Record<string, Handle> = {
    [Types.GHERKIN_SEGMENT_KEYWORD_TYPE]: (node, parent) => {
      const next = findAfter(parent!, node);

      if (!next) {
        return node.value; // e.g. ### Examples:\n
      }

      return `${node.value} `; // e.g. # Feature: ???
    },
    [Types.GHERKIN_STEP_KEYWORD_TYPE]: (node) => {
      return `${node.value} `;
    },
    [Types.GHERKIN_DELIMITED_PARAMETER_TYPE]: (node) => {
      return `<${node.ident}>`;
    },
  };

  return {
    handlers: customHandlers,
  };
}
