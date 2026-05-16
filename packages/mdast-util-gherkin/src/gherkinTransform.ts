import type { Transform } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";
import {
  AND_KEYWORD,
  BACKGROUND_KEYWORD,
  BUT_KEYWORD,
  EXAMPLE_KEYWORD,
  FEATURE_KEYWORD,
  GHERKIN_KEYWORD_TYPE,
  GIVEN_KEYWORD,
  RULE_KEYWORD,
  SCENARIO_KEYWORD,
  SCENARIO_OUTLINE_KEYWORD,
  THEN_KEYWORD,
  WHEN_KEYWORD,
} from "./constant.ts";

const gherkinTransform: Transform = (tree) => {
  visit(tree, "heading", (node) => {
    if (node.children.length === 0) {
      return;
    }

    const firstChild = node.children[0];
    if (firstChild.type === "text") {
      for (const keyword of [
        FEATURE_KEYWORD,
        BACKGROUND_KEYWORD,
        RULE_KEYWORD,
        SCENARIO_KEYWORD,
        SCENARIO_OUTLINE_KEYWORD,
        EXAMPLE_KEYWORD,
      ]) {
        if (firstChild.value.startsWith(`${keyword} `)) {
          // prevent text directive `:color[]{}`
          node.children.shift(); // === firstChild
          node.children.unshift({
            type: "text",
            value: firstChild.value.slice(keyword.length + 1),
          });
          node.children.unshift({ type: GHERKIN_KEYWORD_TYPE, value: keyword });
          break;
        }
      }
    }
  });

  visit(tree, "listItem", (node) => {
    if (node.children.length === 0) {
      return;
    }

    const firstChild = node.children[0];
    if (firstChild.type === "paragraph") {
      if (firstChild.children.length === 0) {
        return;
      }

      if (firstChild.children[0].type === "text") {
        const textNode = firstChild.children[0];
        for (const keyword of [
          GIVEN_KEYWORD,
          WHEN_KEYWORD,
          THEN_KEYWORD,
          AND_KEYWORD,
          BUT_KEYWORD,
        ]) {
          if (textNode.value.startsWith(`${keyword} `)) {
            firstChild.children.shift();
            firstChild.children.unshift({
              type: "text",
              value: textNode.value.slice(keyword.length + 1),
            });
            firstChild.children.unshift({ type: GHERKIN_KEYWORD_TYPE, value: keyword });
            break;
          }
        }
      }
    }
  });

  return tree;
};

export default gherkinTransform;
