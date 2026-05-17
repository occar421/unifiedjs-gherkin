import { GherkinTypes } from "./constant.ts";
import type { Handle } from "mdast-util-to-markdown";
import { findAfter } from "unist-util-find-after";

const handlers: Record<string, Handle> = {
  [GherkinTypes.SEGMENT_KEYWORD_TYPE]: (node, parent) => {
    const next = findAfter(parent!, node);

    if (!next) {
      return node.value; // e.g. ### Examples:\n
    }

    return `${node.value} `; // e.g. # Feature: ???
  },
};

export default handlers;
