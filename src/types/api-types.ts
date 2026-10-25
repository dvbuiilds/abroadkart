// This type is for the User Data to be saved in DB or to be fetched from DB.
export interface DBUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  provider: "credentials" | "google";
  haveFilledPreCounsellingForm: boolean;
  picture?: string;
  nameAbbreviation: string;
}

// This type is for storing the User details after fetching the data from db after logging in.
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  provider: "credentials" | "google";
  haveFilledPreCounsellingForm: boolean;
  picture?: string;
  nameAbbreviation: string;
}

export interface CredentialsProviderUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  provider: "credentials";
  nameAbbreviation: string;
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
  nameAbbreviation: string;
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
