import { type ChangeEvent, type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

// TYPES
import type { DBUser, ResponseType, User } from "@app/types/api-types";

// UTILS
import { fetchWithTimeout } from "@app/utils/fetch-utils";

// CONFIGS
import { apiEndPoints, apiPath } from "@app/config/api-config";

const Signup = () => {
  const [formData, updateFormData] = useState<
    DBUser & { confirmPassword: string }
  >({
    email: "",
    haveFilledPreCounsellingForm: false,
    id: "__",
    name: "",
    phoneNumber: "",
    provider: "credentials",
    password: "",
    confirmPassword: "",
    nameAbbreviation: "_",
  });
  const navigation = useRouter();

  const onFormFieldValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateFormData((prev) => {
      const updatedFormData = { ...prev };
      switch (event.target.name) {
        case "email": {
          updatedFormData.email = event.target.value;
          break;
        }
        case "name": {
          updatedFormData.name = event.target.value;
          break;
        }
        case "phoneNumber": {
          updatedFormData.phoneNumber = event.target.value;
          break;
        }
        case "password": {
          updatedFormData.password = event.target.value;
          break;
        }
        case "confirmPassword": {
          updatedFormData.confirmPassword = event.target.value;
          break;
        }
      }
      return updatedFormData;
    });
  };

  const submitButtonEnabled =
    Object.entries(formData).every((entry) => {
      if (typeof entry[1] === "boolean") return true;
      return entry[1].length > 0;
    }) && formData.confirmPassword === formData.password;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetchWithTimeout(
      `${apiPath}${apiEndPoints.signup}`,
      {
        method: "POST",
        body: JSON.stringify(formData),
      }
    );
    const jsonResponse: ResponseType<User> = await response.json();
    if (!jsonResponse.success) {
      alert(jsonResponse.error.message);
    }
    navigation.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center grow bg-gray-100 py-5">
      <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
      <form className="bg-white p-6 rounded shadow-md w-80" onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
            name="name"
            value={formData.name}
            onChange={onFormFieldValueChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
            name="email"
            value={formData.email}
            onChange={onFormFieldValueChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Phone Number</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={onFormFieldValueChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
            name="password"
            value={formData.password}
            onChange={onFormFieldValueChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Confirm Password</label>
          <input
            type="password"
            className={`w-full p-2 border border-gray-300 rounded mt-1 text-black ${
              formData.password === formData.confirmPassword
                ? ""
                : "border-red-500 focus:border-red-500 active:border-red-500"
            }`}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onFormFieldValueChange}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!submitButtonEnabled}
        >
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-black">
        Already have an account? &nbsp;
        <Link href="/login" className="text-blue-500">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Signup;
