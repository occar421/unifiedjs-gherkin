import { expect, suite, test } from "vite-plus/test";
import { toMarkdown } from "mdast-util-to-markdown";
import { gherkinToMarkdown } from "../src/index.ts";
import type { Nodes } from "mdast";

suite("Markdown with Gherkin to mdast", () => {
  const markdownOfTree = (nodes: Nodes, _options: {} = {}) =>
    toMarkdown(nodes, { bullet: "*", extensions: [gherkinToMarkdown()] });

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
              { type: "text", value: `${keyword}`, data: { gherkin: { type: "segmentKeyword" } } },
              { type: "text", value: `:`, data: { gherkin: { type: "segmentDelimiter" } } },
              { type: "text", value: " " },
              { type: "text", value: "Hello" },
            ],
            data: { gherkin: { type: "segmentLine" } },
          });
          expect(str).toMatch(`${"#".repeat(level)} ${keyword}: Hello`);
        },
      );
    });
  });

  suite.each(["Examples", "Scenarios"])("%s with Table", (keyword) => {
    test.each([1, 2, 3, 4, 5, 6] as const)(
      `Can serialize it to "${keyword}:" from Gherkin segment keyword in h%i`,
      (level) => {
        const str = markdownOfTree({
          type: "heading",
          depth: level,
          children: [
            { type: "text", value: `${keyword}`, data: { gherkin: { type: "segmentKeyword" } } },
            { type: "text", value: `:`, data: { gherkin: { type: "segmentDelimiter" } } },
          ],
          data: { gherkin: { type: "segmentLine" } },
        });
        expect(str).toMatch(`${"#".repeat(level)} ${keyword}:`);
      },
    );
  });

  suite.each(["Given", "When", "Then", "And", "But"])("%s", (keyword) => {
    test(`Can serialize it to "${keyword} " is parsed as Gherkin step keyword in list item`, () => {
      const str = markdownOfTree({
        type: "list",
        ordered: false,
        spread: false,
        children: [
          {
            type: "listItem",
            spread: false,
            children: [
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    value: keyword,
                    data: { gherkin: { type: "stepKeyword" } },
                  },
                  { type: "text", value: " " },
                  { type: "text", value: "there are " },
                  {
                    type: "html",
                    value: "<start>",
                    data: { gherkin: { type: "delimitedParameter", ident: "start" } },
                  },
                  { type: "text", value: " cucumbers" },
                ],
              },
            ],
          },
        ],
      });
      expect(str).toMatch(`* ${keyword} there are <start> cucumbers`);
    });
  });

  suite("Tags", () => {
    test("Can serialize it to Tags", () => {
      const str = markdownOfTree({
        type: "root",
        children: [
          {
            type: "paragraph",
            data: { gherkin: { type: "tagLine" } },
            children: [
              { type: "inlineCode", value: "@important", data: { gherkin: { type: "tag" } } },
              { type: "text", value: " " },
              { type: "inlineCode", value: "@essential", data: { gherkin: { type: "tag" } } },
            ],
          },
          {
            type: "heading",
            depth: 3,
            children: [
              {
                type: "text",
                value: "Scenario Outline:",
              },
              { type: "text", value: " " },
              { type: "text", value: "eating" },
            ],
            data: { gherkin: { type: "segmentLine" } },
          },
        ],
      });

      expect(str).toMatch(
        `${"`@important` `@essential`"}
### Scenario Outline: eating
`,
      );
    });
  });
});
