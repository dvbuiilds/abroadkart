import NextAuth from "next-auth";

// THIRD PARTY
import GoogleProvider from "next-auth/providers/google";
import { v4 as uuidv4 } from "uuid"; // For generating session IDs

// UTILS
import mongoDBClient from "../../../server/db/mongodb"; // Import MongoDB client
import { UserSignedInWithAuthProvider } from "@app/types/api-types";

const db = mongoDBClient.db();
const environment = process.env.ENVIRONMENT ?? "development";
const EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const responseHeaderCookieValue =
  environment === "development"
    ? "HttpOnly; SameSite=Strict; Path=/"
    : "HttpOnly; Secure; SameSite=Strict; Path=/";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    // Ensure redirection happens correctly
    //   async redirect({ url, baseUrl }) {
    //     return url.startsWith(baseUrl) ? url : baseUrl;
    //   },
    async signIn({ user, account, profile }) {
      // console.log(
      //   "@Dhairya signin with google: ",
      //   JSON.stringify({ user, account, profile }, null, 2)
      // );

      try {
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
        //   console.log(
        //     "@Dhairya the google user injected to db: ",
        //     JSON.stringify(userSignedInWithGoogleAuth, null, 2)
        //   );

        const newUserCreated = await db
          .collection("users")
          .insertOne(userSignedInWithGoogleAuth);
        if (!newUserCreated) {
          console.error("Error while creating new user with Google Auth");
          return false;
        }

        //   // Create a new session
        //   const sessionId = uuidv4();
        //   await db.collection("sessions").insertOne({
        //     sessionId,
        //     userId: user.id,
        //     createdAt: new Date(),
        //     expiresAt: new Date(Date.now() + EXPIRY_DURATION),
        //   });
      } catch (error) {
        console.error("Error during login:", error);
        return false;
      }
      return true;
    },
  },
  events: {},
});
