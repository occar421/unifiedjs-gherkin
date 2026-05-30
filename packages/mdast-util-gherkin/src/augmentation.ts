import type { GherkinTypes, SegmentKeywords, StepKeywords } from "./constant.ts";

declare module "mdast" {
  interface HeadingData extends Data {
    gherkin?: {
      type: typeof GherkinTypes.SEGMENT_LINE;
      segmentKeyword: keyof typeof SegmentKeywords;
    };
  }
  interface ParagraphData extends Data {
    gherkin?: {
      type: typeof GherkinTypes.TAG_LINE;
    };
  }
  interface TextData extends Data {
    gherkin?:
      | {
          type: typeof GherkinTypes.SEGMENT_KEYWORD;
          keyword: keyof typeof SegmentKeywords;
        }
      | {
          type: typeof GherkinTypes.STEP_KEYWORD;
          keyword: keyof typeof StepKeywords;
        }
      | {
          type: typeof GherkinTypes.SEGMENT_DELIMITER | typeof GherkinTypes.SEPARATOR;
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
  interface ListItemData extends Data {
    gherkin?: {
      type: typeof GherkinTypes.STEP_LINE;
      stepKeyword: keyof typeof StepKeywords;
    };
  }

  interface Data {
    gherkin?:
      | HeadingData["gherkin"]
      | ParagraphData["gherkin"]
      | TextData["gherkin"]
      | InlineCodeData["gherkin"]
      | HtmlData["gherkin"]
      | ListItemData["gherkin"];
  }
}
