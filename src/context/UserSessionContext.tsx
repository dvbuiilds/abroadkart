import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import { useSession, signIn, signOut } from "next-auth/react";

// TYPES
import type { Session } from "next-auth";
import type { ResponseType, SessionProvider, User } from "../types/api-types";

// UTILS
import { checkIfRouteIsProtected } from "@app/utils/restricted-routes";
import { fetchWithTimeout } from "@app/utils/fetch-utils";

// CONFIGS
import { apiEndPoint, apiPath } from "@app/config/api-config";

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

  fetchUserDetails: () => Promise<void>;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(
  undefined
);

export const UserSessionProvider = ({ children }: { children: ReactNode }) => {
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
    const response = await fetchWithTimeout(
      `${apiEndPoint}${apiPath.getUser}?email=${encodeURIComponent(
        activeSession.data?.user?.email || ""
      )}`
    );
    if (!response.success) {
      console.log("@@ Error in fetching user details: ", response);
      updateUser(null);
      updateSessionProvider("no-provider");
      triggerLogout();
      return;
    }

    const jsonResponse: ResponseType<User> = response.data;
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
      if (
        router.pathname === "/login" ||
        (router.pathname === "/dashboard/pre-counselling-form" &&
          user?.haveFilledPreCounsellingForm)
      )
        router.push("/dashboard");
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
        fetchUserDetails,
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
