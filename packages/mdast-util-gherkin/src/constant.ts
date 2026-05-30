export const GherkinTypes = {
  TAG: "tag",
  TAG_LINE: "tagLine",
  SEGMENT_LINE: "segmentLine",
  SEGMENT_KEYWORD: "segmentKeyword",
  SEGMENT_DELIMITER: "segmentDelimiter",
  STEP_LINE: "stepLine",
  STEP_KEYWORD: "stepKeyword",
  DELIMITED_PARAMETER: "delimitedParameter",
  SEPARATOR: "separator",
} as const;

export const SyntaxTokens = {
  COLON: ":",
} as const;

export const SegmentKeywords = {
  Feature: ["Feature", "Business Need", "Ability"],
  Rule: ["Rule"],
  Scenario: ["Scenario", "Example"],
  Background: ["Background"],
  ScenarioOutline: ["Scenario Outline", "Scenario Template"],
  Examples: ["Examples", "Scenarios"],
} as const;

export const StepKeywords = {
  Given: ["Given"],
  When: ["When"],
  Then: ["Then"],
  And: ["And"],
  But: ["But"],
} as const;
