import type { Literal, Node } from "mdast";
import {
  GHERKIN_SEGMENT_KEYWORD_TYPE,
  GHERKIN_DELIMITED_PARAMETER_TYPE,
  GHERKIN_STEP_KEYWORD_TYPE,
  GHERKIN_TAG_TYPE,
} from "./constant.ts";

export interface GherkinTagKeyword extends Literal {
  type: typeof GHERKIN_TAG_TYPE;
}
export interface GherkinSegmentKeyword extends Literal {
  type: typeof GHERKIN_SEGMENT_KEYWORD_TYPE;
}
export interface GherkinStepKeyword extends Literal {
  type: typeof GHERKIN_STEP_KEYWORD_TYPE;
}
export interface GherkinDelimitedParameter extends Node {
  type: typeof GHERKIN_DELIMITED_PARAMETER_TYPE;
  prefix: string;
  ident: string;
  suffix: string;
}

declare module "mdast" {
  interface PhrasingContentMap {
    gherkinTagKeyword: GherkinTagKeyword;
    gherkinSegmentKeyword: GherkinSegmentKeyword;
    gherkinStepKeyword: GherkinStepKeyword;
    gherkinDelimitedParameter: GherkinDelimitedParameter;
  }
}
