import type { Transform } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";
import { visitParents } from "unist-util-visit-parents";
import { findAllAfter } from "unist-util-find-all-after";
import { findBefore } from "unist-util-find-before";
import {
  AND_KEYWORD,
  BACKGROUND_KEYWORD,
  BUT_KEYWORD,
  EXAMPLE_KEYWORD,
  FEATURE_KEYWORD,
  GHERKIN_SEGMENT_KEYWORD_TYPE,
  GHERKIN_DELIMITED_PARAMETER_TYPE,
  GIVEN_KEYWORD,
  RULE_KEYWORD,
  SCENARIO_KEYWORD,
  SCENARIO_OUTLINE_KEYWORD,
  THEN_KEYWORD,
  WHEN_KEYWORD,
  GHERKIN_STEP_KEYWORD_TYPE,
  GHERKIN_TAG_TYPE,
} from "./constant.ts";

const gherkinTransform: Transform = (tree) => {
  // Segment Keyword
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
          node.children.unshift({ type: GHERKIN_SEGMENT_KEYWORD_TYPE, value: keyword });
          break;
        }
      }
    }
  });

  visitParents(tree, GHERKIN_SEGMENT_KEYWORD_TYPE, (node, ancestors) => {
    if (ancestors.length <= 1) {
      return;
    }
    const heading = ancestors[ancestors.length - 1];
    if (heading.type !== "heading") {
      return;
    }
    const parent = ancestors[ancestors.length - 2];

    const before = findBefore(parent, heading);
    if (!before || before.type !== "paragraph") {
      return;
    }
    const paragraph = before;

    for (let i = 0; i < paragraph.children.length; i++) {
      const child = paragraph.children[i];
      if (child.type === "inlineCode" && child.value.startsWith("@")) {
        paragraph.children[i] = {
          type: GHERKIN_TAG_TYPE,
          value: child.value,
        };
      }
    }
  });

  // Step Keyword
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
            firstChild.children.unshift({ type: GHERKIN_STEP_KEYWORD_TYPE, value: keyword });
            break;
          }
        }
      }
    }
  });

  // Delimited Parameter
  visitParents(tree, GHERKIN_STEP_KEYWORD_TYPE, (node, ancestors) => {
    if (ancestors.length === 0) {
      return;
    }
    const parent = ancestors[ancestors.length - 1];
    if (parent.type !== "paragraph") {
      return;
    }
    const siblings = findAllAfter(parent, node, "html");

    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling.value.startsWith("<") && sibling.value.endsWith(">")) {
        const index = parent.children.indexOf(sibling);
        parent.children[index] = {
          type: GHERKIN_DELIMITED_PARAMETER_TYPE,
          prefix: "<",
          ident: sibling.value.slice(1, -1), // "<foo>" -> "foo"
          suffix: ">",
        };
      }
    }
  });

  return tree;
};

export default gherkinTransform;
