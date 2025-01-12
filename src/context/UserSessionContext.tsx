import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { Session } from "next-auth";
import { useSession, signIn, signOut } from "next-auth/react";

import type { ResponseType, SessionProvider, User } from "../types/api-types";
import { apiEndPoints, apiPaths } from "@app/config/api-config";
import { checkIfRouteIsProtected } from "@app/utils/restricted-routes";

interface UserSessionContextType {
  user: User | null;
  sessionProvider: SessionProvider;
  activeSession: {
    status: "authenticated" | "loading" | "unauthenticated";
    data: Session | null;
  };
  triggerLogin: (
    arg:
      | {
          provider: "email";
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
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(
  undefined
);

export const UserSessionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const activeSession = useSession();

  const [user, updateUser] = useState<User | null>(null);
  const [sessionProvider, updateSessionProvider] =
    useState<SessionProvider>("no-provider");

  const triggerLogin = async (
    arg:
      | {
          provider: "email";
          formData: {
            email: string;
            password: string;
          };
        }
      | { provider: "google" }
  ) => {
    switch (arg.provider) {
      case "email": {
        signIn("credentials", arg.formData);
        router.push("/dashboard");
        break;
      }
      default: {
        signIn(arg.provider);
        break;
      }
    }
  };

  const triggerLogout = () => {
    signOut();
    router.push("/login");
    updateSessionProvider("no-provider");
    updateUser(null);
  };

  const fetchUserDetails = async () => {
    const response = await fetch(
      `${apiPaths.development}${
        apiEndPoints.getUser
      }?email=${encodeURIComponent(activeSession.data?.user?.email)}`
    );
    const jsonResponse: ResponseType<User> = await response.json();
    if (jsonResponse.success) {
      updateUser(jsonResponse.data);
      updateSessionProvider(jsonResponse.data.provider ?? "credentials");
    } else {
      updateUser(null);
      updateSessionProvider("no-provider");
    }
  };

  useEffect(() => {
    if (activeSession.status === "authenticated") {
      fetchUserDetails();
      if (router.pathname === "/login") router.push("/dashboard");
    } else if (
      activeSession.status === "unauthenticated" &&
      checkIfRouteIsProtected(router.pathname)
    ) {
      router.push("/login");
    }
  }, [activeSession.status, router.pathname]);

  return (
    <UserSessionContext.Provider
      value={{
        user,
        sessionProvider,
        activeSession,
        triggerLogin,
        triggerLogout,
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
