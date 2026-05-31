import type { Heading, ListItem } from "mdast";
import { GherkinTypes } from "./constant.ts";
import { findAllAfter } from "unist-util-find-all-after";
import { toString } from "mdast-util-to-string";

/**
 * Get the name of a Gherkin segment from a heading node.
 *
 * @param node
 *   Heading node.
 * @returns
 *   Segment name or `undefined` if the node is not a Gherkin segment line.
 */
export function getSegmentName(node: Heading): string | undefined {
  if (node.data?.gherkin?.type !== GherkinTypes.SEGMENT_LINE) {
    return undefined;
  }

  const separator = node.children.find((child) => child.data?.gherkin?.type === "separator");
  if (!separator) {
    return "";
  }

  const nameNodes = findAllAfter(node, separator);
  return toString(nameNodes).trim();
}

/**
 * Get the name of a Gherkin step from a list item node.
 *
 * @param node
 *   List item node.
 * @returns
 *   Step name or `undefined` if the node is not a Gherkin step line.
 */
export function getStepName(node: ListItem): string | undefined {
  if (node.data?.gherkin?.type !== GherkinTypes.STEP_LINE) {
    return undefined;
  }

  const paragraph = node.children[0];
  if (!paragraph || paragraph.type !== "paragraph") {
    return undefined;
  }

  const separator = paragraph.children.find((child) => child.data?.gherkin?.type === "separator");
  if (!separator) {
    return "";
  }

  const nameNodes = findAllAfter(paragraph, separator);
  return toString(nameNodes).trim();
}
