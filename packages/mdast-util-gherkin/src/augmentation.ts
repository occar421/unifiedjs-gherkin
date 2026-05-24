import { GherkinTypes } from "./constant.ts";

declare module "mdast" {
  interface HeadingData extends Data {
    gherkin?: {
      type: typeof GherkinTypes.SEGMENT_LINE;
    };
  }
  interface ParagraphData extends Data {
    gherkin?: {
      type: typeof GherkinTypes.TAG_LINE;
    };
  }
  interface TextData extends Data {
    gherkin?: {
      type:
        | typeof GherkinTypes.SEGMENT_KEYWORD
        | typeof GherkinTypes.SEGMENT_DELIMITER
        | typeof GherkinTypes.STEP_KEYWORD
        | typeof GherkinTypes.SEPARATOR;
    };
  }
  interface InlineCodeData extends Data {
    gherkin?: {
      type: typeof GherkinTypes.TAG;
    };
  }
  interface HtmlData extends Data {
    gherkin?: {
      type: typeof GherkinTypes.DELIMITED_PARAMETER;
      ident: string;
    };
  }

  interface Data {
    gherkin?:
      | HeadingData["gherkin"]
      | ParagraphData["gherkin"]
      | TextData["gherkin"]
      | InlineCodeData["gherkin"]
      | HtmlData["gherkin"];
  }
}
