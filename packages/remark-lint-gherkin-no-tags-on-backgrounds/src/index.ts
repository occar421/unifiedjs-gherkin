const GherkinTypes = {
  TAG: "tag",
  TAG_LINE: "tagLine",
  SEGMENT_LINE: "segmentLine",
  SEGMENT_KEYWORD: "segmentKeyword",
  SEGMENT_DELIMITER: "segmentDelimiter",
  STEP_KEYWORD: "stepKeyword",
  DELIMITED_PARAMETER: "delimitedParameter",
  SEPARATOR: "separator",
} as const;

const SegmentKeywords = {
  FEATURE: ["Feature", "Business Need", "Ability"],
  RULE: ["Rule"],
  SCENARIO: ["Scenario", "Example"],
  BACKGROUND: ["Background"],
  SCENARIO_OUTLINE: ["Scenario Outline", "Scenario Template"],
  EXAMPLES: ["Examples", "Scenarios"],
} as const;

import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { findBefore } from "unist-util-find-before";
import type { Root } from "mdast";

declare module "mdast" {
  interface Data {
    gherkin?: {
      type?: (typeof GherkinTypes)[keyof typeof GherkinTypes];
      ident?: string;
    };
  }
}

const remarkLintGherkinNoTagsOnBackgrounds = lintRule<Root>(
  "remark-lint:gherkin-no-tags-on-backgrounds",
  (tree, file) => {
    visit(tree, "heading", (heading) => {
      const isBackground =
        heading.data?.gherkin?.type === GherkinTypes.SEGMENT_LINE &&
        heading.children.some(
          (child) =>
            child.data?.gherkin?.type === GherkinTypes.SEGMENT_KEYWORD &&
            child.type === "text" &&
            SegmentKeywords.BACKGROUND.some((x) => x === child.value),
        );
      if (!isBackground) {
        return;
      }

      const paragraph = findBefore(tree, heading);
      if (paragraph?.type !== "paragraph") {
        return;
      }

      if (paragraph.data?.gherkin?.type === GherkinTypes.TAG_LINE) {
        file.message("Tags on backgrounds are not allowed", paragraph);
      }
    });
  },
);

export default remarkLintGherkinNoTagsOnBackgrounds;
