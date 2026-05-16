import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type { Handle, Join, Options as ToMarkdownExtension } from "mdast-util-to-markdown";
import gherkinTransform from "./gherkinTransform.ts";
import { Types } from "./constant.ts";
import { findAfter } from "unist-util-find-after";
import type { GherkinTagLineKeyword } from "./augmentation.ts";

export function gherkinFromMarkdown(): FromMarkdownExtension {
  return {
    transforms: [gherkinTransform],
  };
}

export function gherkinToMarkdown(_options: {} = {}): ToMarkdownExtension {
  const customHandlers: Record<string, Handle> = {
    [Types.GHERKIN_TAG_TYPE]: (node) => {
      return "`" + node.value + "`";
    },
    [Types.GHERKIN_TAG_LINE_TYPE]: (node, _parent, state, info) => {
      const tagLine = node as GherkinTagLineKeyword;

      return tagLine.children.map((tag) => state.handle(tag, tagLine, state, info)).join(" ");
    },
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

  const tagJoin: Join = (left, right) => {
    if (left.type === Types.GHERKIN_TAG_LINE_TYPE && right.type === "heading") {
      return 0;
    }
    return true;
  };

  return {
    handlers: customHandlers,
    join: [tagJoin],
  };
}
