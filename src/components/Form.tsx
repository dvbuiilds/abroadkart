import React from "react";

import type { Questionnaire, QuestionnaireItem } from "@app/types/form-types";

export const Form = ({
  formData,
  currentStep,
  updateFormData,
}: {
  formData: QuestionnaireItem;
  currentStep: number;
  updateFormData: React.Dispatch<React.SetStateAction<Questionnaire>>;
}) => {
  const onChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    questionIndex: number
  ) => {
    updateFormData((prev) => {
      const formDataInfo = [...prev[currentStep].info];
      formDataInfo[questionIndex].answer = event.target.value;
      const currentStepFormData = {
        name: prev[currentStep].name,
        info: formDataInfo,
      };
      const updatedFormData = [...prev];
      updatedFormData[currentStep] = currentStepFormData;
      return updatedFormData;
    });
  };

  return (
    <>
      <p className="text-sm my-4">
        <span className="text-red-600">*</span> All questions are required.
      </p>
      {formData.info.map((infoSet, index) => {
        return (
          <div
            key={`${currentStep}_formData_info_${index}`}
            className="relative z-0 w-full my-6 group"
          >
            <input
              type="text"
              name={`question-${index}`}
              id={`question-${index}`}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=""
              value={infoSet.answer}
              onChange={(event) => onChangeHandler(event, index)}
              required
            />
            <label
              htmlFor={`question-${index}`}
              className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              {infoSet.question}
            </label>
          </div>
        );
      })}
    </>
  );
};
