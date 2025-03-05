import NextAuth from "next-auth";

// THIRD PARTY
import bcrypt from "bcryptjs"; // For password comparison
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// UTILS
import mongoDBClient from "../../../server/db/mongodb"; // Import MongoDB client
import {
  CredentialsProviderUser,
  GoogleProviderUser,
} from "@app/types/api-types";
import { getNameAbbreviation } from "@app/utils/name-abbreviation";

const db = mongoDBClient.db();

export default NextAuth({
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

        // Find the user by email
        const user = (await db.collection("users").findOne({
          email: credentials?.email,
        })) as CredentialsProviderUser | null;

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
  callbacks: {
    async signIn({ user, profile }) {
      try {
        // Check if user already exists
        const userExists = await db
          .collection("users")
          .findOne({ email: profile?.email });
        if (!userExists) {
          // Create a new user
          const userSignedInWithGoogleAuth: GoogleProviderUser = {
            id: user.id,
            googleId: profile?.sub ?? "",
            email: profile?.email ?? "",
            // @ts-expect-error - email_verified is being received in the response but is not present in Profile type.
            emailVerified: !!profile?.email_verified,
            name: profile?.name ?? "",
            // @ts-expect-error - picture is being received in the response but is not present in Profile type.
            picture: profile?.picture ?? "",
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
        }
      } catch (error) {
        console.error("Error during login:", error);
        return false;
      }
      return true;
    },
  },
});
