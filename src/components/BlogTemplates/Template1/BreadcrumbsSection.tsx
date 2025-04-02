import React from "react";
import Link from "next/link";
import type { Breadcrumbs } from "./types";

export const BreadcrumbsSection = (props: { data: Breadcrumbs }) => {
  return (
    <ul className="flex text-sm text-gray-600 px-3">
      {props.data.map((item, index) => (
        <li key={`${item.link}_${index}`} className="flex items-center">
          <Link
            href={decodeURI(item.link)}
            className={
              item.link === "#"
                ? ""
                : "text-blue-600 font-semibold hover:underline"
            }
          >
            {item.label}
          </Link>
          {index < props.data.length - 1 && (
            <span className="mx-2 text-gray-400">/</span>
          )}
        </li>
      ))}
    </ul>
  );
};
