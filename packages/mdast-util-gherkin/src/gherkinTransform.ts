import type { Position } from "unist";
import type { Transform } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";
import { visitParents } from "unist-util-visit-parents";
import { findAllAfter } from "unist-util-find-all-after";
import { findBefore } from "unist-util-find-before";
import { GherkinTypes, SegmentKeywords, StepKeywords, SyntaxTokens } from "./constant.ts";

const gherkinTransform: Transform = (tree) => {
  // Segment Keyword
  visit(tree, "heading", (node) => {
    if (node.children.length === 0) {
      return;
    }

    const firstChild = node.children[0];
    if (firstChild.type === "text") {
      for (const segmentKeyword of Object.values(SegmentKeywords)) {
        const keyword = `${segmentKeyword}${SyntaxTokens.COLON}`;
        // e.g. ### Examples:\n
        if (firstChild.value === keyword) {
          node.children.shift();

          const segmentKeywordPosition: Position | undefined = firstChild.position && {
            start: firstChild.position.start,
            end: {
              ...firstChild.position.start,
              column: firstChild.position.start.column + segmentKeyword.length,
              offset:
                firstChild.position.start.offset &&
                firstChild.position.start.offset + segmentKeyword.length,
            },
          };

          const delimiterPosition: Position | undefined = firstChild.position &&
            segmentKeywordPosition && {
              start: segmentKeywordPosition.end,
              end: firstChild.position.end,
            };

          node.children.unshift(
            {
              type: "text",
              value: segmentKeyword,
              position: segmentKeywordPosition,
              data: { gherkin: { type: GherkinTypes.SEGMENT_KEYWORD } },
            },
            {
              type: "text",
              value: SyntaxTokens.COLON,
              position: delimiterPosition,
              data: { gherkin: { type: GherkinTypes.SEGMENT_DELIMITER } },
            },
          );
          break;
        }

        // e.g. # Feature: ???
        // require space to prevent text directive `:color[]{}`
        if (firstChild.value.startsWith(`${keyword} `)) {
          node.children.shift(); // === firstChild

          const textValue = firstChild.value.slice(keyword.length + 1);

          const segmentKeywordPosition: Position | undefined = firstChild.position && {
            start: firstChild.position.start,
            end: {
              ...firstChild.position.start,
              column: firstChild.position.start.column + segmentKeyword.length,
              offset:
                firstChild.position.start.offset &&
                firstChild.position.start.offset + segmentKeyword.length,
            },
          };

          const delimiterPosition: Position | undefined = firstChild.position &&
            segmentKeywordPosition && {
              start: segmentKeywordPosition.end,
              end: {
                ...segmentKeywordPosition.end,
                column: segmentKeywordPosition.end.column + SyntaxTokens.COLON.length,
                offset:
                  segmentKeywordPosition.end.offset &&
                  segmentKeywordPosition.end.offset + SyntaxTokens.COLON.length,
              },
            };

          const spacePosition: Position | undefined = firstChild.position &&
            delimiterPosition && {
              start: delimiterPosition.end,
              end: {
                ...delimiterPosition.end,
                column: delimiterPosition.end.column + 1,
                offset: delimiterPosition.end.offset && delimiterPosition.end.offset + 1,
              },
            };

          const textPosition: Position | undefined = firstChild.position &&
            spacePosition && {
              start: spacePosition.end,
              end: firstChild.position.end,
            };

          node.children.unshift(
            {
              type: "text",
              value: segmentKeyword,
              position: segmentKeywordPosition,
              data: { gherkin: { type: GherkinTypes.SEGMENT_KEYWORD } },
            },
            {
              type: "text",
              value: SyntaxTokens.COLON,
              position: delimiterPosition,
              data: { gherkin: { type: GherkinTypes.SEGMENT_DELIMITER } },
            },
            {
              type: "text",
              value: " ",
              position: spacePosition,
            },
            {
              type: "text",
              value: textValue,
              position: textPosition,
            },
          );
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

  // Tag line
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

            const keywordPosition: Position | undefined = textNode.position && {
              start: textNode.position.start,
              end: {
                ...textNode.position.start,
                column: textNode.position.start.column + keyword.length,
                offset:
                  textNode.position.start.offset && textNode.position.start.offset + keyword.length,
              },
            };

            const spacePosition: Position | undefined = textNode.position &&
              keywordPosition && {
                start: keywordPosition.end,
                end: {
                  ...keywordPosition.end,
                  column: keywordPosition.end.column + 1,
                  offset: keywordPosition.end.offset && keywordPosition.end.offset + 1,
                },
              };

            const textPosition: Position | undefined = textNode.position &&
              spacePosition && {
                start: spacePosition.end,
                end: textNode.position.end,
              };

            firstChild.children.unshift(
              {
                type: "text",
                value: keyword,
                position: keywordPosition,
                data: { gherkin: { type: GherkinTypes.STEP_KEYWORD } },
              },
              {
                type: "text",
                value: " ",
                position: spacePosition,
              },
              {
                type: "text",
                value: textNode.value.slice(keyword.length + 1),
                position: textPosition,
              },
            );
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
