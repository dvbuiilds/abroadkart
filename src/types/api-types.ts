export type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
};

export type ResponseType<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: { message: string; status: number | string };
    };
