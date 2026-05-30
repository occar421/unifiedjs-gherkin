import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

const remarkLintGherkinUpToOneBackgroundPerFile = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-up-to-one-background-per-file",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-up-to-one-background-per-file#readme",
  },
  (tree, file) => {
    let backgroundCount = 0;

    visit(tree, "heading", (heading) => {
      const isBackground =
        heading.data?.gherkin?.type === "segmentLine" &&
        heading.children.some(
          (child) =>
            child.data?.gherkin?.type === "segmentKeyword" &&
            child.data?.gherkin?.keyword === "Background",
        );

      if (isBackground) {
        backgroundCount++;
        if (backgroundCount > 1) {
          file.message("Only one background is allowed per file", heading);
        }
      }
    });
  },
);

export default remarkLintGherkinUpToOneBackgroundPerFile;
