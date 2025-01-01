import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserSession } from "@app/context/UserSessionContext";

const GoogleIcon = () => (
  <svg
    className="w-6 h- me-2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    data-name="Layer 1"
    id="Layer_1"
  >
    <path
      d="M23.75,16A7.7446,7.7446,0,0,1,8.7177,18.6259L4.2849,22.1721A13.244,13.244,0,0,0,29.25,16"
      fill="#00ac47"
    />
    <path
      d="M23.75,16a7.7387,7.7387,0,0,1-3.2516,6.2987l4.3824,3.5059A13.2042,13.2042,0,0,0,29.25,16"
      fill="#4285f4"
    />
    <path
      d="M8.25,16a7.698,7.698,0,0,1,.4677-2.6259L4.2849,9.8279a13.177,13.177,0,0,0,0,12.3442l4.4328-3.5462A7.698,7.698,0,0,1,8.25,16Z"
      fill="#ffba00"
    />
    <polygon
      fill="#2ab2db"
      points="8.718 13.374 8.718 13.374 8.718 13.374 8.718 13.374"
    />
    <path
      d="M16,8.25a7.699,7.699,0,0,1,4.558,1.4958l4.06-3.7893A13.2152,13.2152,0,0,0,4.2849,9.8279l4.4328,3.5462A7.756,7.756,0,0,1,16,8.25Z"
      fill="#ea4435"
    />
    <polygon
      fill="#2ab2db"
      points="8.718 18.626 8.718 18.626 8.718 18.626 8.718 18.626"
    />
    <path
      d="M29.25,15v1L27,19.5H16.5V14H28.25A1,1,0,0,1,29.25,15Z"
      fill="#4285f4"
    />
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const { triggerLogin, triggerFetchSession } = useUserSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    triggerLogin({ provider: "manual", formData });
  };

  useEffect(() => {
    triggerFetchSession();
  });

  return (
    <div className="flex flex-col items-center justify-center grow bg-gray-100">
      <form
        className="bg-white p-6 rounded shadow-md w-80 flex flex-col"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl font-bold mb-4 text-center">Login</h1>
        <button
          type="button"
          className="self-center border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 mb-2 hover:bg-gray-50"
          onClick={() => triggerLogin({ provider: "google" })}
        >
          <GoogleIcon />
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
          className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600 font-bold"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-black">
        Don't have an account? &nbsp;
        <Link href="/signup" className="text-blue-500">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;
