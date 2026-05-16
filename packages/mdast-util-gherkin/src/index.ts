import { visit } from "unist-util-visit";
import type { Literal } from "mdast";
import type { Extension as FromMarkdownExtension, Transform } from "mdast-util-from-markdown";
import type { Options as ToMarkdownExtension } from "mdast-util-to-markdown";

const GHERKIN_KEYWORD_TYPE = "gherkinKeyword" as const;

const FEATURE_KEYWORD = "Feature:";
const BACKGROUND_KEYWORD = "Background:";
const RULE_KEYWORD = "Rule:";
const SCENARIO_KEYWORD = "Scenario:";
const SCENARIO_OUTLINE_KEYWORD = "Scenario Outline:";
const EXAMPLE_KEYWORD = "Example:";

const GIVEN_KEYWORD = "Given";

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
        if (textNode.value.startsWith(`${GIVEN_KEYWORD} `)) {
          firstChild.children.shift();
          firstChild.children.unshift({
            type: "text",
            value: textNode.value.slice(GIVEN_KEYWORD.length + 1),
          });
          firstChild.children.unshift({ type: GHERKIN_KEYWORD_TYPE, value: GIVEN_KEYWORD });
        }
      }
    }
  });

  return tree;
};

export function gherkinToMarkdown(_options: {} = {}): ToMarkdownExtension {
  return {};
}
