export const GherkinTypes = {
  TAG: "tag",
  TAG_LINE: "tagLine",
  SEGMENT_LINE: "segmentLine",
  SEGMENT_KEYWORD: "segmentKeyword",
  SEGMENT_DELIMITER: "segmentDelimiter",
  STEP_KEYWORD: "stepKeyword",
  DELIMITED_PARAMETER: "delimitedParameter",
  SEPARATOR: "separator",
} as const;

export const SyntaxTokens = {
  COLON: ":",
} as const;

export const SegmentKeywords = {
  FEATURE: ["Feature", "Business Need", "Ability"],
  RULE: ["Rule"],
  SCENARIO: ["Scenario", "Example"],
  BACKGROUND: ["Background"],
  SCENARIO_OUTLINE: ["Scenario Outline", "Scenario Template"],
  EXAMPLES: ["Examples", "Scenarios"],
} as const;

export const StepKeywords = {
  GIVEN: ["Given"],
  WHEN: ["When"],
  THEN: ["Then"],
  AND: ["And"],
  BUT: ["But"],
} as const;
