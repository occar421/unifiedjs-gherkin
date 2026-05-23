export const GherkinTypes = {
  TAG: "tag",
  TAG_LINE: "tagLine",
  SEGMENT_KEYWORD: "segmentKeyword",
  STEP_KEYWORD: "stepKeyword",
  DELIMITED_PARAMETER: "delimitedParameter",
} as const;

export const SyntaxTokens = {
  COLON: ":",
} as const;

export const SegmentKeywords = {
  FEATURE: "Feature",
  RULE: "Rule",
  EXAMPLE: "Example",
  SCENARIO: "Scenario",
  BACKGROUND: "Background",
  SCENARIO_OUTLINE: "Scenario Outline",
  SCENARIO_TEMPLATE: "Scenario Template",
  EXAMPLES: "Examples",
  SCENARIOS: "Scenarios",
} as const;

export const StepKeywords = {
  GIVEN: "Given",
  WHEN: "When",
  THEN: "Then",
  AND: "And",
  BUT: "But",
} as const;
