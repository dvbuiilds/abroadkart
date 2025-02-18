import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import GoogleLogo from "../../public/google-logo-64.png";

import { useUserSession } from "@app/context/UserSessionContext";

const errorMessages: { [key: string]: string } = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  OAuthSignin: "Error signing in with OAuth.",
  OAuthCallback: "Error during OAuth callback.",
  OAuthCreateAccount: "Could not create OAuth account.",
  EmailCreateAccount: "Could not create email account.",
  Callback: "Error during sign-in callback.",
  Default: "An unknown error occurred.",
};

const Login = () => {
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });
  const router = useRouter();
  const { error } = router.query;

  const errorMessage = error
    ? errorMessages[error as string] || errorMessages.Default
    : null;

  const disableSubmitButton = Object.entries(formData).reduce((acc, curr) => {
    return acc || !Boolean(curr[1].length);
  }, false);

  const { triggerLogin } = useUserSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disableSubmitButton) return;
    triggerLogin({ provider: "email", formData });
  };

  return (
    <div className="flex flex-col items-center justify-center grow bg-gray-100">
      <form
        className="bg-white p-6 rounded shadow-md w-80 flex flex-col"
        onSubmit={handleSubmit}
        aria-disabled={disableSubmitButton}
      >
        <h1 className="text-3xl font-bold mb-4 text-center">Login</h1>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <button
          type="button"
          className="self-center border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 mb-2 hover:bg-gray-50"
          onClick={() => triggerLogin({ provider: "google" })}
        >
          <Image
            src={GoogleLogo}
            alt="Google SignIn Icon"
            width={20}
            height={20}
            className="mr-2"
          />
          Sign in with Google
        </button>
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="w-full h-0.5 bg-gray-400"></div>
          <span className="text-gray-800">OR</span>
          <div className="w-full h-0.5 bg-gray-400"></div>
        </div>
        <div className="mb-4">
          <label className="block text-black-700 text-black">Email</label>
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-black-700 text-black">Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600 disabled:bg-blue-300 font-bold cursor-pointer disabled:cursor-not-allowed"
          disabled={disableSubmitButton}
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-black">
        Don&#39;t have an account? &nbsp;
        <Link href="/signup" className="text-blue-500">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;
