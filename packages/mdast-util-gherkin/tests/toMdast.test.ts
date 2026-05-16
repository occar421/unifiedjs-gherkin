import { expect, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown } from "../src/index.ts";

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

    suite.each(["Feature", "Background", "Rule", "Scenario", "Scenario Outline", "Example"])(
      "%s",
      (keyword) => {
        test.each([1, 2, 3, 4, 5, 6])(
          `"${keyword}:" is parsed as Gherkin segment keyword in h%i`,
          (level) => {
            const tree = getTree(`${"#".repeat(level)} ${keyword}: Hello`);
            expect(tree.children).toHaveLength(1);
            expect(tree.children[0]).toMatchObject({
              type: "heading",
              depth: level,
              children: [
                { type: "gherkinSegmentKeyword", value: `${keyword}:` },
                { type: "text", value: "Hello" },
              ],
            });
          },
        );
      },
    );

    suite.each(["Given", "When", "Then", "And", "But"])("%s", (keyword) => {
      test.each(["*", "-"])(
        `"${keyword}:" is parsed as Gherkin step keyword in list item "%s"`,
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
                      { type: "gherkinStepKeyword", value: keyword },
                      { type: "text", value: "there are " },
                      {
                        type: "gherkinDelimitedParameter",
                        prefix: "<",
                        ident: "start",
                        suffix: ">",
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
          children: [
            { type: "gherkinTag", value: "@important" },
            { type: "text", value: " " },
            { type: "gherkinTag", value: "@essential" },
          ],
        });
        expect(tree.children[1]).toMatchObject({
          type: "heading",
          depth: 3,
        });
      });
    });
  });
});
