import { gherkinFromMarkdown, gherkinToMarkdown } from "mdast-util-gherkin";
import type { Processor } from "unified";

declare module "unified" {
  interface Data {
    fromMarkdownExtensions?: unknown[];
    toMarkdownExtensions?: unknown[];
  }
}

export default function remarkGherkin(this: Processor, options: {} = {}) {
  const data = this.data();

  const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  fromMarkdownExtensions.push(gherkinFromMarkdown());
  toMarkdownExtensions.push(gherkinToMarkdown(options));
}
