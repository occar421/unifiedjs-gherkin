import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinUpToOneBackgroundPerFile from "../src/index.ts";

suite("remark-lint-gherkin-up-to-one-background-per-file", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinUpToOneBackgroundPerFile)
    .use(function () {
      this.Compiler = () => {
        return "";
      };
    });

  test("Should not report when there is zero background", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario: Test Scenario\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report when there is one background", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Background:\n- Given a step\n\n## Scenario: Test Scenario\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when there are two backgrounds", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Background:\n- Given a step\n\n## Background:\n- Given another step\n\n## Scenario: Test Scenario\n- Given a step",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Only one background is allowed per file");
    expect(file.messages[0].ruleId).toBe("gherkin-up-to-one-background-per-file");
  });

  test("Should report when there are three backgrounds", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Background:\n1\n\n## Background:\n2\n\n## Background:\n3",
    );
    expect(file.messages).toHaveLength(2);
    expect(file.messages[0].message).toBe("Only one background is allowed per file");
    expect(file.messages[1].message).toBe("Only one background is allowed per file");
  });
});
