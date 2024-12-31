import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiEndPoints, apiPaths } from "@app/config/api-config";
import type { ResponseType, User } from "../types/api-types";

type UserDataFetchStatusType =
  | "idle"
  | "loading"
  | "success"
  | "failure"
  | "error";

type UserSessionStatus = "idle" | "loggedIn" | "loggedOut" | "anonymous";

interface UserSessionContextType {
  user: User | null;
  /**
   * @deprecated
   */
  updateUser: React.Dispatch<React.SetStateAction<User | null>>;
  userSessionStatus: UserSessionStatus;
  userDataFetchStatus: UserDataFetchStatusType;
  triggerLogin: (formData: {
    email: string;
    password: string;
  }) => Promise<void>;
  triggerLogout: () => void;
  triggerFetchSession: () => Promise<void>;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(
  undefined
);

const environment: "development" | "production" =
  (process.env.ENVIRONMENT as "development" | "production") ?? "development";

// Right now not being used. But can be used to make API calls.
const userLoginUrl = `${apiPaths[environment]}${apiEndPoints.login}`;
const userLogoutUrl = `${apiPaths[environment]}${apiEndPoints.logout}`;
const userSessionUrl = `${apiPaths[environment]}${apiEndPoints.session}`;

const handleUserLogin = async (
  formData: { email: string; password: string },
  onSuccessCallback: (userData: User) => void,
  onFailureCallback: (
    errorMessage: string,
    status: UserDataFetchStatusType
  ) => void
) => {
  try {
    const response = await fetch(apiEndPoints.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const jsonResponse: ResponseType<User> = await response.json();
    if (jsonResponse.success) {
      onSuccessCallback(jsonResponse.data);
    } else {
      onFailureCallback(jsonResponse.error.message, "failure");
    }
  } catch (error) {
    console.error("Failed to login:", error);
    onFailureCallback(
      "Internal Server Error. Please try again after some time.",
      "error"
    );
  }
};

const handleLogout = async (onLogoutCallback: () => void) => {
  try {
    const response = await fetch(apiEndPoints.logout, {
      method: "POST",
      credentials: "include", // Ensures cookies are sent with the request
    });

    const jsonResponse: ResponseType<User> = await response.json();
    if (jsonResponse.success) {
      onLogoutCallback();
    } else {
      // something i need to plan like clearing all cookies and then calling the callback.
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("Failed to logout. Please try again.");
  }
};

const fetchActiveSession = async (
  sessionFoundCallback: (userData: User) => void,
  sessionNotFoundCallback: () => void
) => {
  try {
    const response = await fetch(apiEndPoints.session);
    const jsonResponse: ResponseType<User> = await response.json();

    if (jsonResponse.success) {
      sessionFoundCallback(jsonResponse.data);
    } else {
      sessionNotFoundCallback();
    }
  } catch (error) {
    console.error("Failed to fetch session:", error);
    sessionNotFoundCallback();
  }
};

export const UserSessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, updateUser] = useState<User | null>(null);
  const [userDataFetchStatus, updateUserDataFetchStatus] =
    useState<UserDataFetchStatusType>("idle");
  const [userSessionStatus, updateUserSessionStatus] =
    useState<UserSessionStatus>("anonymous");

  // const router = useRouter();

  const triggerLogin = async (formData: {
    email: string;
    password: string;
  }) => {
    // the fetchStatus is also to be edited here.
    handleUserLogin(
      formData,
      (userData) => {
        updateUser(userData);
        updateUserDataFetchStatus("success");
        updateUserSessionStatus("loggedIn");
      },
      (errorMessage, status) => {
        updateUser(null);
        updateUserDataFetchStatus(status);
        updateUserSessionStatus("anonymous");
        alert(errorMessage);
      }
    );
  };

  const triggerLogout = () => {
    handleLogout(() => {
      updateUser(null);
      updateUserSessionStatus("loggedOut");
      // Redirect to login page after successful logout
      // router.push("/login");
    });
  };

  const triggerFetchSession = async () => {
    console.log("Inside triggerFetchSession.");
    fetchActiveSession(
      (userData) => {
        updateUser(userData);
        updateUserSessionStatus("loggedIn");
      },
      () => {
        updateUser(null);
        updateUserSessionStatus("anonymous");
      }
    );
  };

  useEffect(() => {
    console.log("Inside UserSessionContext useEffect.");
    triggerFetchSession();
  }, []);

  return (
    <UserSessionContext.Provider
      value={{
        user,
        updateUser,
        userSessionStatus,
        userDataFetchStatus,
        triggerLogin,
        triggerLogout,
        triggerFetchSession,
      }}
    >
      {children}
    </UserSessionContext.Provider>
  );
};

export const useUserSession = () => {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  }
  return context;
};
