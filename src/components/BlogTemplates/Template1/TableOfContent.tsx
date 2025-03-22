import React from "react";
import Link from "next/link";
import type { TableOfContentsSection } from "./types";

export const TableOfContents = (props: { data: TableOfContentsSection }) => {
  return (
    <div className="px-3">
      <h2 className="text-xl font-medium py-2 md:font-semibold md:text-2xl">
        {props.data.title}
      </h2>
      <ul>
        {props.data.content.map((node, index) => (
          <li key={`node-${index}`}>
            <Link href={node.id} className="text-sm">{`${index + 1}. ${
              node.label
            }`}</Link>
            <ul>
              {node.children.map((childNode, childIndex) => (
                <li key={`childNode-${childIndex}`}>
                  <Link href={childNode.id} className="text-sm">{`${
                    index + 1
                  }. ${childNode.label}`}</Link>
                  <ul>
                    {childNode.children.map(
                      (grandChildNode, grandChildIndex) => (
                        <li key={`grandChildNode-${grandChildIndex}`}>
                          <Link href={grandChildNode.id} className="text-sm">
                            {`${index + 1}. ${grandChildNode.label}`}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};
