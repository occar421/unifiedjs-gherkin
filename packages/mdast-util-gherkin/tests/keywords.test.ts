import { expect, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown } from "../src/index.ts";

suite("gherkin", () => {
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

    suite.each(["Feature", "Background", "Rule", "Scenario", "Scenario Outline", "Example"])(
      "%s",
      (keyword) => {
        test.each([1, 2, 3, 4, 5, 6])(
          `"${keyword}:" is parsed as GherkinKeyword in h%i`,
          (level) => {
            const tree = getTree(`${"#".repeat(level)} ${keyword}: Hello`);
            expect(tree.children).toHaveLength(1);
            expect(tree.children[0]).toMatchObject({
              type: "heading",
              depth: level,
              children: [
                { type: "gherkinKeyword", value: `${keyword}:` },
                { type: "text", value: "Hello" },
              ],
            });
          },
        );
      },
    );

    suite("Given", () => {
      test(`"Given:" is parsed as GherkinKeyword in list item"`, () => {
        const tree = getTree(`* Given there are 3 cucumbers`);

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
                    { type: "gherkinKeyword", value: "Given" },
                    { type: "text", value: "there are 3 cucumbers" },
                  ],
                },
              ],
            },
          ],
        });
      });
    });
  });
});
