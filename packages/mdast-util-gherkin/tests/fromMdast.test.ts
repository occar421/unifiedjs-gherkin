import { expect, suite, test } from "vite-plus/test";
import { toMarkdown } from "mdast-util-to-markdown";
import { gherkinToMarkdown } from "../src/index.ts";
import type { Nodes } from "mdast";

suite("Markdown with Gherkin to mdast", () => {
  const markdownOfTree = (nodes: Nodes, _options: {} = {}) =>
    toMarkdown(nodes, { extensions: [gherkinToMarkdown()] });

  suite("keyword", () => {
    suite.each([
      "Feature",
      "Background",
      "Rule",
      "Scenario",
      "Scenario Outline",
      "Example",
      "Scenario Template",
      "Examples",
      "Scenarios",
    ])("%s", (keyword) => {
      test.each([1, 2, 3, 4, 5, 6] as const)(
        `Can serialize it to "${keyword}: ???" from Gherkin segment keyword in h%i`,
        (level) => {
          const str = markdownOfTree({
            type: "heading",
            depth: level,
            children: [
              { type: "gherkinSegmentKeyword", value: `${keyword}:` },
              { type: "text", value: "Hello" },
            ],
          });
          expect(str).toMatch(`${"#".repeat(level)} ${keyword}: Hello`);
        },
      );
    });
  });

  suite.each(["Examples", "Scenarios"])("%s with Table", (keyword) => {
    test.each([1, 2, 3, 4, 5, 6] as const)(
      `"${keyword}:" is parsed as Gherkin segment keyword in h%i`,
      (level) => {
        const str = markdownOfTree({
          type: "heading",
          depth: level,
          children: [{ type: "gherkinSegmentKeyword", value: `${keyword}:` }],
        });
        expect(str).toMatch(`${"#".repeat(level)} ${keyword}:`);
      },
    );
  });
});
