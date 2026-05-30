import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

export type Options = {
  tags?: string[];
  patterns?: string[];
};

const remarkLintGherkinAllowedTags = lintRule<Root, Options>(
  {
    origin: "remark-lint:gherkin-allowed-tags",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-allowed-tags#readme",
  },
  (tree, file, options) => {
    const { tags = [], patterns = [] } = options || {};

    if (tags.length === 0 && patterns.length === 0) {
      return;
    }

    const regexps = patterns.map((p) => new RegExp(p));

    visit(tree, "inlineCode", (inlineCode) => {
      if (inlineCode.data?.gherkin?.type !== "tag") {
        return;
      }

      const tag = inlineCode.value;

      const isAllowed = tags.includes(tag) || regexps.some((re) => re.test(tag));
      if (!isAllowed) {
        file.message(`Tag \`${tag}\` is not allowed`, inlineCode);
      }
    });
  },
);

export default remarkLintGherkinAllowedTags;
