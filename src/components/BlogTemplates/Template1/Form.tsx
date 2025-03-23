import React, { useState } from "react";

interface FormData {
  email: string;
  fullName: string;
  whatsappNumber: string;
  targetCountry: string;
  targetUniversity: string;
  targetCourse: string;
  targetYear: string;
  message: string;
  counsellingMode?: string;
  budget: number;
}

export const Form = () => {
  const [formData, updateFormData] = useState<FormData>({
    email: "",
    fullName: "",
    whatsappNumber: "",
    targetCountry: "",
    targetUniversity: "",
    targetCourse: "",
    targetYear: "",
    message: "",
    counsellingMode: "Call",
    budget: 0,
  });

  const onChangeHandler = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    updateFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const onClickHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("@@ form submitted", formData);
  };

  const isAnyFieldEmpty = !Object.entries(formData).every(
    ([_, val]) => val.length > 0
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-lg font-semibold">
        Request a Callback for FREE COUNSELLING!
      </p>
      <form className="py-1 flex flex-col gap-2" onSubmit={onClickHandler}>
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={formData.email}
            onChange={onChangeHandler}
            required
          />
        </div>
        <div>
          <label
            htmlFor="fullName"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Full Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={formData.fullName}
            onChange={onChangeHandler}
            required
          />
        </div>
        <div>
          <label
            htmlFor="whatsappNumber"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            WhatsApp Number <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            name="whatsappNumber"
            id="whatsappNumber"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={formData.whatsappNumber}
            onChange={onChangeHandler}
            required
          />
        </div>

        <div>
          <label
            htmlFor="targetCountry"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Target Country <span className="text-red-600">*</span>
          </label>
          <select
            name="targetCountry"
            id="targetCountry"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={formData.targetCountry}
            onChange={onChangeHandler}
            required
          >
            <option value="">Select Country</option>
            <option value="USA">USA</option>
            <option value="Canada">Canada</option>
            <option value="UK">UK</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="targetUniversity"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Target University
          </label>
          <input
            type="text"
            name="targetUniversity"
            id="targetUniversity"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={formData.targetUniversity}
            onChange={onChangeHandler}
          />
        </div>

        <div>
          <label
            htmlFor="targetCourse"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Target Course
          </label>
          <input
            type="text"
            name="targetCourse"
            id="targetCourse"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={formData.targetCourse}
            onChange={onChangeHandler}
          />
        </div>

        <div>
          <label
            htmlFor="targetYear"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Target Year <span className="text-red-600">*</span>
          </label>
          <select
            name="targetYear"
            id="targetYear"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={formData.targetYear}
            onChange={onChangeHandler}
            required
          >
            <option value="">Select Year</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Message
          </label>
          <textarea
            name="message"
            id="message"
            rows={3}
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={formData.message}
            onChange={onChangeHandler}
          ></textarea>
        </div>

        <div>
          <label
            htmlFor="counsellingMode"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Preferred Mode of Counselling
          </label>
          <select
            name="counsellingMode"
            id="counsellingMode"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={formData.counsellingMode}
            onChange={onChangeHandler}
          >
            <option value="Email">Email</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Call">Call</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="budget"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Estimated Budget for Studies (USD)
          </label>
          <input
            type="number"
            name="budget"
            id="budget"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={formData.budget}
            onChange={onChangeHandler}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 w-40 items-center justify-center"
          disabled={isAnyFieldEmpty}
        >
          Submit
        </button>
      </form>
    </div>
  );
};
