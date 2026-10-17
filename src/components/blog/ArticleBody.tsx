import { Fragment, createElement } from "react";
import parse, {
  domToReact,
  type DOMNode,
  type Element,
  type HTMLReactParserOptions,
} from "html-react-parser";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { classifyHref } from "@app/lib/blog/links";

const HEADING_TAGS = new Set(["h2", "h3", "h4", "h5", "h6"]);

const isTag = (node: DOMNode): node is Element => node.type === "tag";

/**
 * The first row of a table that has no <thead>. Many legacy tables use a bold
 * first row as their header, so that row becomes column headers.
 */
function headerLessFirstRow(table: Element): Element | undefined {
  const sections = (table.children as DOMNode[]).filter(isTag);
  if (sections.some((section) => section.name === "thead")) return undefined;

  const rows = sections.flatMap((section) => {
    if (section.name === "tr") return [section];
    if (section.name === "tbody") {
      return (section.children as DOMNode[]).filter(isTag).filter((row) => row.name === "tr");
    }
    return [];
  });
  return rows[0];
}

/**
 * Renders a post's stored HTML.
 *
 * Only markup changes here; visible text never does. Links are rewritten for
 * routing and tables and headings get wrappers, but no text is added (the
 * "#" on headings is drawn with CSS, and the arrow on external links is an SVG).
 */
export function ArticleBody({ html }: { html: string }) {
  const headerRows = new Set<Element>();

  const options: HTMLReactParserOptions = {
    replace(node: DOMNode) {
      if (node.type !== "tag") return undefined;
      const element = node as Element;
      const { name, attribs } = element;
      const renderChildren = () =>
        domToReact(element.children as DOMNode[], options);

      if (name === "a") {
        const link = classifyHref(attribs.href);
        switch (link.kind) {
          case "internal":
            return <Link href={link.href}>{renderChildren()}</Link>;
          case "anchor":
            return <a href={link.href}>{renderChildren()}</a>;
          case "external":
            return (
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {renderChildren()}
                <ArrowUpRight
                  aria-hidden="true"
                  className="ml-0.5 inline size-3.5 align-[-0.1em]"
                />
              </a>
            );
          case "none":
            return undefined;
        }
      }

      if (name === "tr" && headerRows.has(element)) {
        return (
          <tr>
            {(element.children as DOMNode[]).map((cell, index) => (
              <Fragment key={index}>
                {isTag(cell) && cell.name === "td" ? (
                  <th scope="col">{domToReact(cell.children as DOMNode[], options)}</th>
                ) : (
                  domToReact([cell], options)
                )}
              </Fragment>
            ))}
          </tr>
        );
      }

      if (name === "table") {
        const firstRow = headerLessFirstRow(element);
        if (firstRow) headerRows.add(firstRow);
        return (
          <div
            className="table-wrap"
            role="region"
            aria-label="Table"
            tabIndex={0}
          >
            <table>{renderChildren()}</table>
          </div>
        );
      }

      if (HEADING_TAGS.has(name) && attribs.id) {
        return createElement(
          name,
          { id: attribs.id },
          renderChildren(),
          <a
            href={`#${attribs.id}`}
            className="heading-anchor"
            aria-label="Link to this section"
          />
        );
      }

      return undefined;
    },
  };

  return (
    <article id="article-body" className="prose max-w-none">
      {parse(html, options)}
    </article>
  );
}
