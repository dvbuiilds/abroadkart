import { useState } from "react";
import Link from "next/link";
import { useUserSession } from "@app/context/UserSessionContext";

const Login = () => {
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const { triggerLogin } = useUserSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    triggerLogin(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center grow bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <form
        className="bg-white p-6 rounded shadow-md w-80"
        onSubmit={handleSubmit}
      >
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
          className="w-full bg-blue-500 text-white p-2 rounded mt-4"
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
