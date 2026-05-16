import type { Position } from "unist";
import type { Transform } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";
import { visitParents } from "unist-util-visit-parents";
import { findAllAfter } from "unist-util-find-all-after";
import { findBefore } from "unist-util-find-before";
import { Types, SegmentKeywords, StepKeywords } from "./constant.ts";

const gherkinTransform: Transform = (tree) => {
  // Segment Keyword
  visit(tree, "heading", (node) => {
    if (node.children.length === 0) {
      return;
    }

    const firstChild = node.children[0];
    if (firstChild.type === "text") {
      for (const keyword of Object.values(SegmentKeywords)) {
        // e.g. ### Examples:\n
        if (firstChild.value === keyword) {
          node.children.shift(); // === firstChild

          node.children.unshift({
            type: Types.GHERKIN_SEGMENT_KEYWORD_TYPE,
            value: keyword,
            position: firstChild.position,
          });
          break;
        }

        // e.g. # Feature: ???
        // require space to prevent text directive `:color[]{}`
        if (firstChild.value.startsWith(`${keyword} `)) {
          node.children.shift(); // === firstChild

          const textValue = firstChild.value.slice(keyword.length + 1);
          const textPosition: Position | undefined = firstChild.position && {
            start: {
              line: firstChild.position.start.line,
              column: firstChild.position.start.column + keyword.length + 1,
              offset:
                firstChild.position.start.offset &&
                firstChild.position.start.offset + keyword.length + 1,
            },
            end: firstChild.position.end,
          };
          node.children.unshift({
            type: "text",
            value: textValue,
            position: textPosition,
          });

          const keywordPosition: Position | undefined = firstChild.position && {
            start: firstChild.position.start,
            end: {
              line: firstChild.position.start.line,
              column: firstChild.position.start.column + keyword.length,
              offset:
                firstChild.position.start.offset &&
                firstChild.position.start.offset + keyword.length,
            },
          };
          node.children.unshift({
            type: Types.GHERKIN_SEGMENT_KEYWORD_TYPE,
            value: keyword,
            position: keywordPosition,
          });
          break;
        }
      }
    }
  });

  // Tags
  visitParents(tree, Types.GHERKIN_SEGMENT_KEYWORD_TYPE, (node, ancestors) => {
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
          type: Types.GHERKIN_TAG_TYPE,
          value: child.value,
          position: child.position,
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
        for (const keyword of Object.values(StepKeywords)) {
          if (textNode.value.startsWith(`${keyword} `)) {
            firstChild.children.shift();

            firstChild.children.unshift({
              type: "text",
              value: textNode.value.slice(keyword.length + 1),
            });

            const keywordPosition: Position | undefined = textNode.position && {
              start: textNode.position.start,
              end: {
                line: textNode.position.start.line,
                column: textNode.position.start.column + keyword.length,
                offset:
                  textNode.position.start.offset && textNode.position.start.offset + keyword.length,
              },
            };
            firstChild.children.unshift({
              type: Types.GHERKIN_STEP_KEYWORD_TYPE,
              value: keyword,
              position: keywordPosition,
            });
            break;
          }
        }
      }
    }
  });

  // Delimited Parameter
  visitParents(tree, Types.GHERKIN_STEP_KEYWORD_TYPE, (node, ancestors) => {
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
          type: Types.GHERKIN_DELIMITED_PARAMETER_TYPE,
          ident: sibling.value.slice(1, -1), // "<foo>" -> "foo"
        };
      }
    }
  });

  return tree;
};

export default gherkinTransform;
