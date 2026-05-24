import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinNoTagsOnBackgrounds from "../src/index.ts";

suite("remark-lint-gherkin-no-tags-on-backgrounds", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinNoTagsOnBackgrounds)
    .use(function () {
      // Dummy compiler
      this.Compiler = () => {
        return "";
      };
    });

  test("Should not report when no tags on background", () => {
    const file = processor.processSync("# Feature: Test\n\n## Background:\n- Given a step");
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when tags on background", () => {
    const file = processor.processSync("# Feature: Test\n\n`@tag`\n## Background:\n- Given a step");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Tags on backgrounds are not allowed");
    expect(file.messages[0].ruleId).toBe("gherkin-no-tags-on-backgrounds");
  });

  test("Should not report when tags on scenario", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n`@tag`\n\n## Scenario: Test Scenario\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report when tags on feature", () => {
    const file = processor.processSync(
      "`@tag`\n\n# Feature: Test\n\n## Background:\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });
});
