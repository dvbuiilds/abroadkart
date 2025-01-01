export type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
};

export interface UserSignedInWithAuthProvider {
  id: string; // Primary key (your internal ID)
  googleId: string; // From "sub" field
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
  provider: string; // e.g., "google"
  phoneNumber?: string;
}

export type ResponseType<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: { message: string; status: number | string };
    };
