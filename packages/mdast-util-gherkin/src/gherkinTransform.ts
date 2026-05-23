import type { Position } from "unist";
import type { Transform } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";
import { visitParents } from "unist-util-visit-parents";
import { findAllAfter } from "unist-util-find-all-after";
import { findBefore } from "unist-util-find-before";
import { GherkinTypes, SegmentKeywords, StepKeywords } from "./constant.ts";

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
          firstChild.data = {
            ...firstChild.data,
            gherkin: { type: GherkinTypes.SEGMENT_KEYWORD },
          };
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

          const spacePosition: Position | undefined = firstChild.position &&
            textPosition && {
              start: {
                line: firstChild.position.start.line,
                column: firstChild.position.start.column + keyword.length,
                offset:
                  firstChild.position.start.offset &&
                  firstChild.position.start.offset + keyword.length,
              },
              end: textPosition.start,
            };
          node.children.unshift({
            type: "text",
            value: " ",
            position: spacePosition,
          });

          const keywordPosition: Position | undefined = firstChild.position &&
            spacePosition && {
              start: firstChild.position.start,
              end: spacePosition.start,
            };
          node.children.unshift({
            type: "text",
            value: keyword,
            position: keywordPosition,
            data: { gherkin: { type: GherkinTypes.SEGMENT_KEYWORD } },
          });
          break;
        }
      }
    }
  });

  // Tags
  visitParents(tree, "text", (node, ancestors) => {
    if (node.data?.gherkin?.type !== GherkinTypes.SEGMENT_KEYWORD) {
      return;
    }

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
        child.data = { ...child.data, gherkin: { type: GherkinTypes.TAG } };
      }
    }
  });

  // Tag ine
  visit(tree, "paragraph", (node) => {
    const tagsOnly = node.children.every(
      (child) =>
        child.data?.gherkin?.type === GherkinTypes.TAG ||
        (child.type === "text" && child.value.trim() === ""),
    );
    if (!tagsOnly) {
      return;
    }

    node.data = { ...node.data, gherkin: { type: GherkinTypes.TAG_LINE } };
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

            const textPosition: Position | undefined = textNode.position && {
              start: {
                line: textNode.position.start.line,
                column: textNode.position.start.column + keyword.length + 1,
                offset:
                  textNode.position.start.offset &&
                  textNode.position.start.offset + keyword.length + 1,
              },
              end: textNode.position.end,
            };
            firstChild.children.unshift({
              type: "text",
              value: textNode.value.slice(keyword.length + 1),
              position: textPosition,
            });

            const spacePosition: Position | undefined = textNode.position &&
              textPosition && {
                start: {
                  line: textNode.position.start.line,
                  column: textNode.position.start.column + keyword.length,
                  offset:
                    textNode.position.start.offset &&
                    textNode.position.start.offset + keyword.length,
                },
                end: textPosition.start,
              };
            firstChild.children.unshift({
              type: "text",
              value: " ",
              position: spacePosition,
            });

            const keywordPosition: Position | undefined = textNode.position &&
              spacePosition && {
                start: textNode.position.start,
                end: spacePosition.start,
              };
            firstChild.children.unshift({
              type: "text",
              value: keyword,
              position: keywordPosition,
              data: { gherkin: { type: GherkinTypes.STEP_KEYWORD } },
            });
            break;
          }
        }
      }
    }
  });

  // Delimited Parameter
  visitParents(tree, "text", (node, ancestors) => {
    if (node.data?.gherkin?.type !== GherkinTypes.STEP_KEYWORD) {
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
        sibling.data = {
          ...sibling.data,
          gherkin: {
            type: GherkinTypes.DELIMITED_PARAMETER,
            ident: sibling.value.slice(1, -1), // "<foo>" -> "foo"
          },
        };
      }
    }
  });

  return tree;
};

export default gherkinTransform;
