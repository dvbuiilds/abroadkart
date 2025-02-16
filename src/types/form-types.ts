export interface QuestionnaireItemInfo {
  question: string;
  answer: string;
}

export interface QuestionnaireItem {
  name: string;
  info: QuestionnaireItemInfo[];
}

export type Questionnaire = QuestionnaireItem[];
