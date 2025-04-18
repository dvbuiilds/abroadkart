import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import { useSession, signIn, signOut, getSession } from "next-auth/react";

// TYPES
import type { Session } from "next-auth";
import type { SessionProvider, User } from "../types/api-types";

// UTILS
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

  fetchUserDetails: () => Promise<void>;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(
  undefined
);

export const UserSessionProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const activeSession = useSession();
  console.log("@@ activeSession: ", activeSession);

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
    signOut({ callbackUrl: "/login" });
    updateSessionProvider("no-provider");
    updateUser(null);
  };

  const fetchUserDetails = async () => {
    const sessionResponse = await getSession();
    if (sessionResponse?.user) {
      const sessionUser = sessionResponse.user as User;
      updateUser(sessionUser);
      updateSessionProvider(sessionUser?.provider ?? "credentials");
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
