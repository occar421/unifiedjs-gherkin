import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinMaxScenariosPerFile from "../src/index.ts";

suite("remark-lint-gherkin-max-scenarios-per-file", () => {
  const getProcessor = (options?: { maxScenarios?: number; countOutlineExamples?: boolean }) =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinMaxScenariosPerFile, options)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when scenario count is within limit", () => {
    const processor = getProcessor({ maxScenarios: 2 });
    const file = processor.processSync(`
# Feature: Test
## Scenario: 1
## Scenario: 2
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when scenario count exceeds limit", () => {
    const processor = getProcessor({ maxScenarios: 1 });
    const file = processor.processSync(`
# Feature: Test
## Scenario: 1
## Scenario: 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Expected at most 1 scenarios, but found 2");
    expect(file.messages[0].ruleId).toBe("gherkin-max-scenarios-per-file");
  });

  test("Should count Scenario Outlines examples by default", () => {
    const processor = getProcessor({ maxScenarios: 2 });
    const file = processor.processSync(`
# Feature: Test
### Scenario Outline: 1
#### Examples:

| a |
| - |
| 1 |
| 2 |
| 3 |
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Expected at most 2 scenarios, but found 3");
  });

  test("Should not count Scenario Outlines examples when countOutlineExamples is false", () => {
    const processor = getProcessor({ maxScenarios: 2, countOutlineExamples: false });
    const file = processor.processSync(`
# Feature: Test
### Scenario Outline: 1
#### Examples:

| a |
| - |
| 1 |
| 2 |
| 3 |
### Scenario Outline: 2
#### Examples:

| b |
| - |
| 4 |
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should handle multiple Example tables for one Scenario Outline", () => {
    const processor = getProcessor({ maxScenarios: 2 });
    const file = processor.processSync(`
# Feature: Test
### Scenario Outline: 1
#### Examples:

| a |
| - |
| 1 |

#### Examples:

| a |
| - |
| 2 |
| 3 |
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Expected at most 2 scenarios, but found 3");
  });

  test("Should handle mix of Scenarios and Scenario Outlines", () => {
    const processor = getProcessor({ maxScenarios: 3 });
    const file = processor.processSync(`
# Feature: Test
## Scenario: 1
### Scenario Outline: 2
#### Examples:

| a |
| - |
| 1 |
| 2 |
`);
    expect(file.messages).toHaveLength(0);

    const processorFail = getProcessor({ maxScenarios: 2 });
    const fileFail = processorFail.processSync(`
# Feature: Test
## Scenario: 1
### Scenario Outline: 2
#### Examples:

| a |
| - |
| 1 |
| 2 |
`);
    expect(fileFail.messages).toHaveLength(1);
    expect(fileFail.messages[0].message).toBe("Expected at most 2 scenarios, but found 3");
  });

  test("Should use default limit of 10", () => {
    const processor = getProcessor();
    let content = "# Feature: Test\n";
    for (let i = 0; i < 10; i++) {
      content += `## Scenario: ${i}\n`;
    }
    const fileOk = processor.processSync(content);
    expect(fileOk.messages).toHaveLength(0);

    content += "## Scenario: 11\n";
    const fileFail = processor.processSync(content);
    expect(fileFail.messages).toHaveLength(1);
    expect(fileFail.messages[0].message).toBe("Expected at most 10 scenarios, but found 11");
  });
});
