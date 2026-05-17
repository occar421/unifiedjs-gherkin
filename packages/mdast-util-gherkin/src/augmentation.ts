import { GherkinTypes } from "./constant.ts";

declare module "mdast" {
  interface Data {
    gherkin?: {
      type?: (typeof GherkinTypes)[keyof typeof GherkinTypes];
      ident?: string;
    };
  }
}
