import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { findBefore } from "unist-util-find-before";
import type { Root } from "mdast";

const remarkLintGherkinNoTagsOnBackgrounds = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-tags-on-backgrounds",
    url: "https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-gherkin-no-tags-on-backgrounds#readme",
  },
  (tree, file) => {
    visit(tree, "heading", (heading) => {
      const isBackground =
        heading.data?.gherkin?.type === "segmentLine" &&
        heading.children.some(
          (child) =>
            child.data?.gherkin?.type === "segmentKeyword" &&
            child.data?.gherkin?.keyword === "Background",
        );
      if (!isBackground) {
        return;
      }

      const paragraph = findBefore(tree, heading);
      if (paragraph?.type !== "paragraph") {
        return;
      }

      if (paragraph.data?.gherkin?.type === "tagLine") {
        file.message("Tags on backgrounds are not allowed", paragraph);
      }
    });
  },
);

export default remarkLintGherkinNoTagsOnBackgrounds;
