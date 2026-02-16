import { type ChangeEvent } from "react";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";

import type { QuestionsSet } from "@app/types/form-types";
import { QuestionTypeMap } from "@app/config/form-questions-config";

interface FormProps {
  formData: QuestionsSet;
  currentStep: number;
  onDataChange: (
    questionSetIndex: number,
    questionIndex: number,
    updatedValue: string | string[]
  ) => void;
}

export const Form = ({ formData, currentStep, onDataChange }: FormProps) => {
  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (formData.questions[index].type !== QuestionTypeMap.TEXT) return;
    const value = event.target.value;
    onDataChange(currentStep, index, value);
  };
  const handleSelectedOptionChange = (value: string, index: number) => {
    if (formData.questions[index].type !== QuestionTypeMap.SELECT) return;
    onDataChange(currentStep, index, value);
  };
  const handleMultipleSelectChange = (index: number, option: string) => {
    if (formData.questions[index].type !== QuestionTypeMap.MULTISELECT) return;
    const currentValues: string[] = formData.questions[index].answer || [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter((item) => item !== option)
      : [...currentValues, option];
    onDataChange(currentStep, index, newValues);
  };

  return (
    <div className="space-y-6">
      {formData.questions.map((questionObj, index) => {
        const { question, required, validationRegex, answer } = questionObj;

        switch (questionObj.type) {
          case QuestionTypeMap.TEXT:
            return (
              <div key={index}>
                <Label htmlFor={`question-${index}`} className="block mb-2">
                  {question}
                  {required ? (
                    <span className="text-red-500 ml-1">*</span>
                  ) : null}
                </Label>
                <Input
                  id={`question-${index}`}
                  type="text"
                  value={answer}
                  required={required}
                  pattern={validationRegex}
                  onChange={(event) => handleTextChange(event, index)}
                />
              </div>
            );

          case QuestionTypeMap.SELECT:
            return (
              <div key={index}>
                <Label className="block mb-2">
                  {question}
                  {required ? (
                    <span className="text-red-500 ml-1">*</span>
                  ) : null}
                </Label>
                <Select
                  value={answer as string}
                  onValueChange={(value) =>
                    handleSelectedOptionChange(value, index)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionObj.options.map((opt, i) => (
                      <SelectItem
                        key={i}
                        value={opt || `option-${i}`}
                        className="cursor-pointer"
                      >
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );

          case QuestionTypeMap.MULTISELECT:
            return (
              <div key={index}>
                <Label className="block mb-2">
                  {question}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="space-y-2">
                  {questionObj.options.map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={answer.includes(opt)}
                        onCheckedChange={() =>
                          handleMultipleSelectChange(index, opt)
                        }
                        id={`question-${index}-opt-${i}`}
                      />
                      <Label
                        htmlFor={`question-${index}-opt-${i}`}
                        className="cursor-pointer"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
