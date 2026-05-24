import { GherkinTypes } from "./constant.ts";
import type { Join } from "mdast-util-to-markdown";

const tagJoin: Join = (left, right) => {
  if (
    left.type === "paragraph" &&
    left.data?.gherkin?.type === GherkinTypes.TAG_LINE &&
    right.type === "heading"
  ) {
    return 0;
  }
  return true;
};

export default [tagJoin];
