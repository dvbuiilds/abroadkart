import React from "react";
import type { TableOfContentsSection } from "./types";

export const TableOfContents = (props: { data: TableOfContentsSection }) => {
  // I am writing this scroll handler seperately because the default onClick event handler is not binding properly causing no effect when the list items are clicked/pressed.
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="px-3">
      <h2 className="text-xl font-medium py-2 md:font-semibold md:text-2xl">
        {props.data.title}
      </h2>
      <nav>
        <ol className="list-decimal list-inside">
          {props.data.content.map((node, index) => (
            <li key={`node-${index}`}>
              <a
                href={node.id}
                className=""
                title={node.label}
                onClick={() => handleScroll(node.id)}
              >
                {node.label}
              </a>
              <ol className="list-decimal list-inside">
                {node.children.map((childNode, childIndex) => (
                  <li key={`childNode-${childIndex}`}>
                    <a href={childNode.id} className="" title={childNode.label}>
                      {childNode.label}
                    </a>
                    <ol className="list-decimal list-inside">
                      {childNode.children.map(
                        (grandChildNode, grandChildIndex) => (
                          <li key={`grandChildNode-${grandChildIndex}`}>
                            <a
                              href={grandChildNode.id}
                              className=""
                              title={grandChildNode.label}
                            >
                              {grandChildNode.label}
                            </a>
                          </li>
                        )
                      )}
                    </ol>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};
