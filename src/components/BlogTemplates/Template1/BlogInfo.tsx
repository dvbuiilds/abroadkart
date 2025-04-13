import type { InfoSection } from "./types";

export const BlogInfo = (props: { data: InfoSection }) => {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="text-gray-600">
        <p>
          Written by:
          <strong>{` ${props.data.authorName} -`}</strong>
          <span>{props.data.authorBio}</span>
        </p>
        <p>
          {props.data.publishedDate === props.data.lastModifiedDate ? (
            <span className="text-sm italic">{`Published Date: ${props.data.publishedDate}`}</span>
          ) : (
            <span className="text-sm italic">{`Last Modified Date: ${props.data.lastModifiedDate}`}</span>
          )}
        </p>
      </div>
    </div>
  );
};
