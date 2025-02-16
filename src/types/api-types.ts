import { WithId } from "mongodb";

// This type is for storing the User details after fetching the data from db after logging in.
export type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  provider: "credentials" | "google";
  haveFilledPreCounsellingForm: boolean;
};

export interface CredentialsProviderUser extends WithId<Document> {
  id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  provider: "credentials";
}

export interface GoogleProviderUser {
  id: string; // Primary key (your internal ID)
  googleId: string; // From "sub" field
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
  provider: "google";
  phoneNumber?: string;
}

export interface GoogleSessionUser {
  email: string;
  image: string;
  name: string;
}

export type SessionProvider = "no-provider" | "credentials" | "google";

export type ResponseType<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: { message: string; status: number | string };
    };
