import type { Literal, Node } from "mdast";
import { Types } from "./constant.ts";

export interface GherkinTagKeyword extends Literal {
  type: typeof Types.GHERKIN_TAG_TYPE;
}
export interface GherkinSegmentKeyword extends Literal {
  type: typeof Types.GHERKIN_SEGMENT_KEYWORD_TYPE;
}
export interface GherkinStepKeyword extends Literal {
  type: typeof Types.GHERKIN_STEP_KEYWORD_TYPE;
}
export interface GherkinDelimitedParameter extends Node {
  type: typeof Types.GHERKIN_DELIMITED_PARAMETER_TYPE;
  ident: string;
}

declare module "mdast" {
  interface PhrasingContentMap {
    gherkinTagKeyword: GherkinTagKeyword;
    gherkinSegmentKeyword: GherkinSegmentKeyword;
    gherkinStepKeyword: GherkinStepKeyword;
    gherkinDelimitedParameter: GherkinDelimitedParameter;
  }
}
