import { QuestionTypeMap } from "@app/config/form-questions-config";

type QuestionCommonAttributes = {
  required?: boolean;
  validationRegex?: string;
};

export interface TextQuestionObject extends QuestionCommonAttributes {
  type: typeof QuestionTypeMap.TEXT;
  question: string;
  answer: string;
}

export interface SelectQuestionObject extends QuestionCommonAttributes {
  type: typeof QuestionTypeMap.SELECT;
  question: string;
  options: string[];
  answer: string;
}

export interface MultiSelectQuestionObject extends QuestionCommonAttributes {
  type: typeof QuestionTypeMap.MULTISELECT;
  question: string;
  options: string[];
  answer: string[];
}

export type QuestionObject =
  | TextQuestionObject
  | SelectQuestionObject
  | MultiSelectQuestionObject;

export type QuestionObjects = QuestionObject[];

export interface QuestionsSet {
  name: string;
  questions: QuestionObjects;
}

export type QuestionsSets = QuestionsSet[];
