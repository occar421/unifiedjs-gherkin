import { Types } from "./constant.ts";
import type { Handle } from "mdast-util-to-markdown";
import type { GherkinTagLineKeyword } from "./augmentation.ts";
import { findAfter } from "unist-util-find-after";

const handlers: Record<string, Handle> = {
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

export default handlers;
