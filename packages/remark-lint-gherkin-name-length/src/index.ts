import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visitParents } from "unist-util-visit-parents";
import type { Root } from "mdast";
import { getSegmentName, getStepName } from "mdast-util-gherkin";

export interface Options {
  Feature?: number;
  Scenario?: number;
  Step?: number;
}

const remarkLintGherkinNameLength = lintRule<Root, Options>(
  {
    origin: "remark-lint:gherkin-name-length",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-name-length#readme",
  },
  (tree, file, options) => {
    const limits = {
      feature: options?.Feature ?? 70,
      scenario: options?.Scenario ?? 70,
      step: options?.Step ?? 70,
    };

    visitParents(tree, (node) => {
      if (node.type === "heading" && node.data?.gherkin?.type === "segmentLine") {
        const heading = node;
        const segmentKeyword = node.data.gherkin.segmentKeyword;

        const limitKey =
          segmentKeyword === "Feature"
            ? "feature"
            : segmentKeyword === "Scenario" || segmentKeyword === "ScenarioOutline"
              ? "scenario"
              : null;

        if (!limitKey) {
          return;
        }

        const name = getSegmentName(heading) ?? "";
        const limit = limits[limitKey];
        if (name.length > limit) {
          file.message(
            `Expected ${{ feature: "Feature", scenario: "Scenario" }[limitKey]} name to be at most ${limit} characters, but found ${name.length}`,
            heading,
          );
        }
      } else if (node.type === "listItem") {
        const listItem = node;

        if (listItem.data?.gherkin?.type !== "stepLine") {
          return;
        }

        const name = getStepName(listItem) ?? "";
        const limit = limits.step;
        if (name.length > limit) {
          file.message(
            `Expected Step name to be at most ${limit} characters, but found ${name.length}`,
            listItem,
          );
        }
      }
    });
  },
);

export default remarkLintGherkinNameLength;
