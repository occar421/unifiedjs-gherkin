import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visitParents } from "unist-util-visit-parents";
import { findAllAfter } from "unist-util-find-all-after";
import type { Root, Heading, Table, Node, Parent } from "mdast";

export interface Options {
  maxScenarios?: number;
  countOutlineExamples?: boolean;
}

const remarkLintGherkinMaxScenariosPerFile = lintRule<Root, Options>(
  {
    origin: "remark-lint:gherkin-max-scenarios-per-file",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-max-scenarios-per-file#readme",
  },
  (tree, file, options) => {
    const maxScenarios = options?.maxScenarios ?? 10;
    const countOutlineExamples = options?.countOutlineExamples ?? true;
    let scenarioCount = 0;

    visitParents(tree, "heading", (node: Heading, ancestors: Node[]) => {
      const gherkin = node.data?.gherkin;
      if (gherkin?.type !== "segmentLine") return;

      if (gherkin.segmentKeyword === "Scenario") {
        scenarioCount++;
        return;
      } else if (gherkin.segmentKeyword !== "ScenarioOutline") {
        return;
      } else if (!countOutlineExamples) {
        scenarioCount++;
        return;
      }

      const parent = ancestors[ancestors.length - 1] as Parent;
      // Find Examples after this Scenario Outline
      const afterNodes = findAllAfter(parent, node);
      let examplesFound = false;

      for (let i = 0; i < afterNodes.length; i++) {
        const afterNode = afterNodes[i];
        // Stop if we hit another Scenario or ScenarioOutline or Feature or Rule
        if (afterNode.type === "heading" && afterNode.data?.gherkin?.type === "segmentLine") {
          if (afterNode?.data?.gherkin?.segmentKeyword !== "Examples") {
            break;
          }
          examplesFound = true;

          // Look for the next table after this Examples heading
          const nodesAfterExamples = afterNodes.slice(i + 1);

          for (const potentialTable of nodesAfterExamples) {
            // If we hit another heading before a table, this Examples might be empty
            if (potentialTable.type === "heading") {
              break;
            }
            if (potentialTable.type === "table") {
              const table = potentialTable as Table;
              // Subtract 1 for header row
              const rows = Math.max(0, table.children.length - 1);
              scenarioCount += rows;
              break;
            }
          }
        }
      }

      if (!examplesFound) {
        // If no examples found, it counts as 1 (though it might be invalid Gherkin)
        scenarioCount++;
      }
    });

    if (scenarioCount > maxScenarios) {
      file.message(`Expected at most ${maxScenarios} scenarios, but found ${scenarioCount}`, tree);
    }
  },
);

export default remarkLintGherkinMaxScenariosPerFile;
