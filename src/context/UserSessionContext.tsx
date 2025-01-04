import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiEndPoints, apiPaths } from "@app/config/api-config";
import type { ResponseType, User } from "../types/api-types";
import { useSession, signIn, signOut } from "next-auth/react";

type UserDataFetchStatusType =
  | "idle"
  | "loading"
  | "success"
  | "failure"
  | "error";

type UserSessionStatus = "idle" | "loggedIn" | "loggedOut" | "anonymous";

interface UserSessionContextType {
  user: User | null;
  userSessionStatus: UserSessionStatus;
  triggerLogin: (
    arg:
      | {
          provider: "manual";
          formData: {
            email: string;
            password: string;
          };
        }
      | {
          provider: "google";
        }
  ) => Promise<void>;
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

const handleUserLoginByEmail = async (
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

const handleUserLoginByAuthProvider = async (provider: string) => {
  console.log("Inside handleUserLoginByAuthProvider.");
  // debugger;
  const response = await signIn(provider, {
    redirect: false,
    callbackUrl: "/dashboard",
  });
  // debugger;
  console.log(
    "@dhairya handleUserLoginByAuthProvider response: ",
    JSON.stringify(response, null, 2)
  );
};

const handleLogout = async (onLogoutCallback: () => void) => {
  try {
    const response = await fetch(apiEndPoints.logout, {
      method: "POST",
      credentials: "include", // Ensures cookies are sent with the request
    });

    onLogoutCallback(); // Whatever the response is, we are logging out the user.

    // const jsonResponse: ResponseType<User> = await response.json();
    // if (jsonResponse.success) {
    //   onLogoutCallback();
    // } else {
    //   // something i need to plan like clearing all cookies and then calling the callback.
    // }
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
  const [userSessionStatus, updateUserSessionStatus] =
    useState<UserSessionStatus>("anonymous");

  const router = useRouter();
  const { data, status } = useSession();
  console.log("@Dhairya inside UserSessionProvider checking useSession: ", {
    data,
    status,
  });

  const triggerLogin = async (
    arg:
      | {
          provider: "manual";
          formData: {
            email: string;
            password: string;
          };
        }
      | { provider: "google" }
  ) => {
    if (arg.provider === "manual") {
      console.log('Inside triggerLogin. arg.provider === "manual"');
      // the fetchStatus is also to be edited here.
      handleUserLoginByEmail(
        arg.formData,
        (userData) => {
          updateUser(userData);
          updateUserSessionStatus("loggedIn");
        },
        (errorMessage, status) => {
          updateUser(null);
          updateUserSessionStatus("anonymous");
          alert(errorMessage);
        }
      );
    } else {
      console.log('Inside triggerLogin. arg.provider === "google"');
      handleUserLoginByAuthProvider(arg.provider);
    }
  };

  const triggerLogout = () => {
    handleLogout(() => {
      updateUser(null);
      updateUserSessionStatus("loggedOut");
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
    // Fetch user session if userSessionStatus is not "loggedIn".
    if (userSessionStatus !== "loggedIn") {
      triggerFetchSession();
    }

    if (userSessionStatus === "loggedIn" && router.pathname === "/login") {
      router.push("/dashboard"); // Redirect logged-in users to /dashboard
    } else if (
      userSessionStatus !== "loggedIn" &&
      router.pathname === "/dashboard"
    ) {
      router.push("/login"); // Redirect logged-out users to /login
    }
  }, [userSessionStatus]);

  return (
    <UserSessionContext.Provider
      value={{
        user,
        userSessionStatus,
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
