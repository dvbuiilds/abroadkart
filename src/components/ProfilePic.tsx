import React from "react";
import Image from "next/image";
import { Button } from "@app/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@app/components/ui/popover";
import { LogOut } from "lucide-react";
import { User } from "@app/types/api-types";

export const ProfilePic = (
  props:
    | { profilePicPresent: true; src: string; alt: string }
    | { profilePicPresent: false; nameAbbreviation: string }
) => {
  if (props.profilePicPresent) {
    return (
      <div className="rounded-full overflow-hidden h-8 w-8 border border-white flex items-center justify-center">
        <Image src={props.src} alt={props.alt} width={32} height={32} />
      </div>
    );
  }

  return (
    <div className="rounded-full overflow-hidden h-8 w-8 border border-white flex items-center justify-center bg-blue-500 text-white">
      {props.nameAbbreviation}
    </div>
  );
};

export const ProfileMenu = ({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => void;
}) => {
  const ProfilePicComponent = user?.picture ? (
    <ProfilePic profilePicPresent={true} src={user.picture} alt={user.name} />
  ) : (
    <ProfilePic
      profilePicPresent={false}
      nameAbbreviation={user?.nameAbbreviation || "XX"}
    />
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer">{ProfilePicComponent}</div>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-2">
        <Button
          variant="ghost"
          className="w-full flex justify-start gap-2 hover:bg-red-100 hover:text-red-600"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </PopoverContent>
    </Popover>
  );
};
