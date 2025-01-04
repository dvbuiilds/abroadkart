import NextAuth from "next-auth";

// THIRD PARTY
import GoogleProvider from "next-auth/providers/google";

// UTILS
import mongoDBClient from "../../../server/db/mongodb"; // Import MongoDB client
import { UserSignedInWithAuthProvider } from "@app/types/api-types";

const db = mongoDBClient.db();

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if user already exists
        const userExists = await db
          .collection("users")
          .findOne({ email: profile?.email });
        if (!userExists) {
          // Create a new user
          const userSignedInWithGoogleAuth: UserSignedInWithAuthProvider = {
            id: user.id,
            googleId: profile?.sub ?? "",
            email: profile?.email ?? "",
            // @ts-ignore - email_verified is being received in the response but is not present in Profile type.
            emailVerified: !!profile?.email_verified,
            name: profile?.name ?? "",
            // @ts-ignore - picture is being received in the response but is not present in Profile type.
            picture: profile?.picture ?? "",
            provider: account?.provider ?? "google",
            phoneNumber: "",
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
