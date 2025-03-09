import { type ChangeEvent } from "react";

import type { QuestionnaireItem } from "@app/types/form-types";

export const Form = ({
  formData,
  currentStep,
  onDataChange,
}: {
  formData: QuestionnaireItem;
  currentStep: number;
  onDataChange: (
    event: ChangeEvent<HTMLInputElement>,
    questionIndex: number
  ) => void;
}) => {
  return (
    <>
      <p className="text-sm my-4">
        <span className="text-red-600">*</span> All questions are required.
      </p>
      {formData.info.map((infoSet, index) => {
        return (
          <div key={`${currentStep}_formData_info_${index}`} className="mb-5">
            <label
              htmlFor="text"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              {infoSet.question}
            </label>
            <input
              type="text"
              name={`question-${index}`}
              id={`question-${index}`}
              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder=""
              value={infoSet.answer}
              onChange={(event) => onDataChange(event, index)}
              required
            />
          </div>
        );
      })}
    </>
  );
};
