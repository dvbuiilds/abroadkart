import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

type UserDataFetchStatusType =
  | "idle"
  | "loading"
  | "success"
  | "failure"
  | "error";

interface UserDataContextType {
  user: User | null;
  updateUser: React.Dispatch<React.SetStateAction<User | null>>;
  userDataFetchStatus: UserDataFetchStatusType;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, updateUser] = useState<User | null>(null);
  const [userDataFetchStatus, updateUserDataFetchStatus] =
    useState<UserDataFetchStatusType>("idle");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        updateUserDataFetchStatus("loading");
        const response = await fetch("/api/auth/session");
        // console.log({ response });
        if (!response.ok) {
          updateUser(null);
          updateUserDataFetchStatus("failure");
        } else {
          const data = await response.json();
          console.log({ data });
          updateUser(data.user);
          updateUserDataFetchStatus("success");
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        updateUser(null);
        updateUserDataFetchStatus("error");
      }
    };

    fetchSession();
  }, []);

  return (
    <UserDataContext.Provider value={{ user, updateUser, userDataFetchStatus }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a UserDataProvider");
  }
  return context;
};
