import NextAuth, { AuthOptions } from "next-auth";

// THIRD PARTY
import bcrypt from "bcryptjs"; // For password comparison
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// UTILS
import { db } from "../../../server/db/mongodb";
import {
  CredentialsProviderUser,
  GoogleProviderUser,
} from "@app/types/api-types";
import { getNameAbbreviation } from "@app/utils/name-abbreviation";
import { serverSideCache } from "../../../utils/server-side/ServerSideCache";

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Custom Email Provider
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input fields
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Create cache key using email
        const userCacheKey = [credentials.email];

        // Check cache for user data
        const cachedUser = serverSideCache.get(userCacheKey);

        let user = null;

        if (cachedUser !== undefined) {
          user = cachedUser;
        } else {
          // Find the user by email
          user = (await db.collection("users").findOne({
            email: credentials?.email,
          })) as CredentialsProviderUser | null;

          // Cache the user data
          serverSideCache.set(userCacheKey, user);
        }

        if (!user) {
          return null;
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          return null;
        }

        // User is authenticated
        return {
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          id: user._id.toString(),
          provider: "credentials",
          nameAbbreviation: user.nameAbbreviation,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, profile }) {
      try {
        if (!profile?.email) return false;

        // Create cache key using email
        const userExistsCacheKey = [profile.email];

        // Check cache for existing user
        const cachedUserExists = serverSideCache.get(userExistsCacheKey);

        let userExists = null;

        if (cachedUserExists !== undefined) {
          userExists = cachedUserExists;
        } else {
          // Check if user already exists
          userExists = await db
            .collection("users")
            .findOne({ email: profile?.email });

          // Cache the result
          serverSideCache.set(userExistsCacheKey, userExists);
        }

        if (!userExists) {
          // Create a new user
          const userSignedInWithGoogleAuth: GoogleProviderUser = {
            id: user.id,
            googleId: profile?.sub ?? "",
            email: profile?.email ?? "",
            emailVerified: !!(profile as any)?.email_verified,
            name: profile?.name ?? "",
            picture: (profile as any)?.picture ?? "",
            provider: "google",
            phoneNumber: "",
            nameAbbreviation: getNameAbbreviation(profile?.name ?? ""),
          };
          const newUserCreated = await db
            .collection("users")
            .insertOne(userSignedInWithGoogleAuth);
          if (!newUserCreated) {
            console.error("Error while creating new user with Google Auth");
            return false;
          }

          // Update cache with new user data
          serverSideCache.set(userExistsCacheKey, userSignedInWithGoogleAuth);
        }
      } catch (error) {
        console.error("Error during login:", error);
        return false;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // When user logs in for the first time
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.provider = account?.provider || "google";
        token.nameAbbreviation = getNameAbbreviation(user?.name || "X");
      }
      return token;
    },
    async session({ session, token }) {
      if (!token?.email) return session;

      const email = token?.email;

      // Create cache key using email
      const sessionCacheKey = [email, "session"];

      // Check cache for session data
      const cachedSessionData = serverSideCache.get(sessionCacheKey);

      let dbUser = null;
      let form = null;

      if (cachedSessionData !== undefined) {
        dbUser = cachedSessionData.dbUser;
        form = cachedSessionData.form;
      } else {
        dbUser = await db.collection("users").findOne({ email });
        form = await db.collection("pre-counselling-form").findOne({ email });

        // Cache the session data
        serverSideCache.set(sessionCacheKey, { dbUser, form });
      }

      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        provider: token.provider,
        picture: token.picture,
        nameAbbreviation: token.nameAbbreviation,
        phoneNumber: dbUser?.phoneNumber || null,
        haveFilledPreCounsellingForm: !!form,
      };

      return session;
    },
  },
};

export default NextAuth(authOptions);
