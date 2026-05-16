import { Types } from "./constant.ts";
import type { Join } from "mdast-util-to-markdown";

const tagJoin: Join = (left, right) => {
  if (left.type === Types.GHERKIN_TAG_LINE_TYPE && right.type === "heading") {
    return 0;
  }
  return true;
};

export default [tagJoin];
