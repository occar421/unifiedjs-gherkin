import { expect, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown, getSegmentName, getStepName } from "../src/index.ts";
import type { Heading, ListItem } from "mdast";

suite("Utilities", () => {
  const getTree = (text: string) =>
    fromMarkdown(text, undefined, { mdastExtensions: [gherkinFromMarkdown()] });

  suite("getSegmentName", () => {
    test("should return segment name from heading", () => {
      const tree = getTree("# Feature: Hello world");
      const heading = tree.children[0] as Heading;
      expect(getSegmentName(heading)).toBe("Hello world");
    });

    test("should return segment name from heading without name", () => {
      const tree = getTree("# Examples:");
      const heading = tree.children[0] as Heading;
      expect(getSegmentName(heading)).toBe("");
    });

    test("should return undefined for non-gherkin heading", () => {
      const tree = getTree("# Normal heading");
      const heading = tree.children[0] as Heading;
      expect(getSegmentName(heading)).toBeUndefined();
    });
  });

  suite("getStepName", () => {
    test("should return step name from list item", () => {
      const tree = getTree("* Given there are <start> cucumbers");
      const list = tree.children[0] as any;
      const listItem = list.children[0] as ListItem;
      expect(getStepName(listItem)).toBe("there are <start> cucumbers");
    });

    test("should return undefined for non-gherkin list item", () => {
      const tree = getTree("* Normal list item");
      const list = tree.children[0] as any;
      const listItem = list.children[0] as ListItem;
      expect(getStepName(listItem)).toBeUndefined();
    });
  });
});
