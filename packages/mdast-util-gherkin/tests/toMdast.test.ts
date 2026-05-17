import { expect, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown } from "../src/index.ts";
import { readFileSync } from "fs";

suite("Markdown with Gherkin to mdast", () => {
  const getTree = (text: string, _options: {} = {}) =>
    fromMarkdown(text, undefined, { mdastExtensions: [gherkinFromMarkdown()] });

  suite("keyword", () => {
    suite("No degradation", () => {
      test.each([1, 2, 3, 4, 5, 6])("Normal header should pass through in h%i", (level) => {
        const tree = getTree(`${"#".repeat(level)} Hello`);
        expect(tree.children).toHaveLength(1);
        expect(tree.children[0]).toMatchObject({
          type: "heading",
          depth: level,
          children: [{ type: "text", value: "Hello" }],
        });
      });

      test("Normal list item should pass through", () => {
        const tree = getTree(`* Hello`);
        expect(tree.children).toHaveLength(1);
        expect(tree.children[0]).toMatchObject({
          type: "list",
          ordered: false,
          spread: false,
          children: [
            {
              type: "listItem",
              spread: false,
              children: [{ type: "paragraph", children: [{ type: "text", value: "Hello" }] }],
            },
          ],
        });
      });
    });

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
      test.each([1, 2, 3, 4, 5, 6])(
        `"${keyword}: ???" is parsed as Gherkin segment keyword in h%i`,
        (level) => {
          const tree = getTree(`${"#".repeat(level)} ${keyword}: Hello`);
          expect(tree.children).toHaveLength(1);
          expect(tree.children[0]).toMatchObject({
            type: "heading",
            depth: level,
            children: [
              { type: "text", value: `${keyword}:`, data: { gherkin: { type: "segmentKeyword" } } },
              { type: "text", value: " " },
              { type: "text", value: "Hello" },
            ],
          });
        },
      );
    });

    suite.each(["Examples", "Scenarios"])("%s with Table", (keyword) => {
      test.each([1, 2, 3, 4, 5, 6])(
        `"${keyword}:" is parsed as Gherkin segment keyword in h%i`,
        (level) => {
          const tree = getTree(`${"#".repeat(level)} ${keyword}:`);
          expect(tree.children).toHaveLength(1);
          expect(tree.children[0]).toMatchObject({
            type: "heading",
            depth: level,
            children: [
              { type: "text", value: `${keyword}:`, data: { gherkin: { type: "segmentKeyword" } } },
            ],
          });
        },
      );
    });

    suite.each(["Given", "When", "Then", "And", "But"])("%s", (keyword) => {
      test.each(["*", "-"])(
        `"${keyword} " is parsed as Gherkin step keyword in list item "%s"`,
        (bulletSign) => {
          const tree = getTree(`${bulletSign} ${keyword} there are <start> cucumbers`);

          expect(tree.children).toHaveLength(1);
          expect(tree.children[0]).toMatchObject({
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
                      { type: "text", value: keyword, data: { gherkin: { type: "stepKeyword" } } },
                      { type: "text", value: " " },
                      { type: "text", value: "there are " },
                      {
                        type: "html",
                        value: "<start>",
                        data: {
                          gherkin: {
                            type: "delimitedParameter",
                            ident: "start",
                          },
                        },
                      },
                      { type: "text", value: " cucumbers" },
                    ],
                  },
                ],
              },
            ],
          });
        },
      );
    });

    suite("Tags", () => {
      test("Tags are parsed correctly", () => {
        const tree = getTree(`
${"`@important` `@essential`"}
### Scenario Outline: eating
`);
        expect(tree.children).toHaveLength(2);

        expect(tree.children[0]).toMatchObject({
          type: "paragraph",
          data: { gherkin: { type: "tagLine" } },
          children: [
            { type: "inlineCode", value: "@important", data: { gherkin: { type: "tag" } } },
            { type: "text", value: " " },
            { type: "inlineCode", value: "@essential", data: { gherkin: { type: "tag" } } },
          ],
        });
        expect(tree.children[1]).toMatchObject({
          type: "heading",
          depth: 3,
        });
      });
    });
  });

  suite("Test with fixtures", () => {
    test("mdgExample.feature.md", () => {
      const content = readFileSync(
        import.meta.dirname + "/fixtures/mdgExample.feature.md",
        "utf-8",
      );
      const tree = getTree(content);
      expect(tree).toMatchSnapshot();
    });
  });
});
