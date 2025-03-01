import React from "react";

export const ProfilePic = (
  props:
    | { profilePicPresent: true; src: string; alt: string }
    | { profilePicPresent: false; nameAbbreviation: string }
) => {
  if (props.profilePicPresent) {
    return (
      <div className="rounded-full overflow-hidden h-8 w-8 border border-white flex items-center justify-center">
        <img src={props.src} alt={props.alt} />
      </div>
    );
  }

  return (
    <div className="rounded-full overflow-hidden h-8 w-8 border border-white flex items-center justify-center bg-blue-500 text-white">
      {props.nameAbbreviation}
    </div>
  );
};
