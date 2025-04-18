import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// COMPONENTS
import { FormProgressBar } from "@app/components/FormProgressBar/FormProgressBar";
import { Form } from "@app/components/Form";

import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";

// TYPES
import type { QuestionsSets } from "@app/types/form-types";

// UTILS
import { useUserSession } from "@app/context/UserSessionContext";
import { fetchWithTimeout } from "@app/utils/fetch-utils";

// CONFIGS
import { apiEndPoint, apiPath } from "@app/config/api-config";
import { QuestionTypeMap } from "@app/config/form-questions-config";

const LOCAL_STORAGE_TIME = 1000 * 30;
let formChangesDetected = false;
const transformedQuestionSet = {
  sets: [
    {
      name: "Personal and Academic Background",
      questions: [
        {
          type: QuestionTypeMap.TEXT,
          question: "What is your current state of residence in India?",
          required: true,
        },
        {
          type: QuestionTypeMap.SELECT,
          question: "Do you hold citizenship of any country other than India?",
          options: ["Yes", "No"],
          required: true,
        },
        {
          type: QuestionTypeMap.SELECT,
          question: "What is your highest level of education completed?",
          options: ["High School", "Bachelor's", "Master's", "PhD", "Other"],
          required: true,
        },
        {
          type: QuestionTypeMap.TEXT,
          question:
            "What was your field of study, and what was your GPA or percentage?",
        },
        {
          type: QuestionTypeMap.MULTISELECT,
          question:
            "Have you taken any standardized tests (e.g., GRE, GMAT, IELTS, TOEFL, PTE)?",
          options: ["GRE", "GMAT", "IELTS", "TOEFL", "PTE", "None"],
        },
        {
          type: QuestionTypeMap.TEXT,
          question: "Do you have any academic achievements or awards?",
        },
      ],
    },
    {
      name: "Study Abroad Preferences and Career Goals",
      questions: [
        {
          type: QuestionTypeMap.MULTISELECT,
          question: "Which countries are you considering for higher education?",
          options: ["USA", "UK", "Canada", "Australia", "Germany", "Other"],
          required: true,
        },
        {
          type: QuestionTypeMap.TEXT,
          question: "Do you have a specific university or program in mind?",
        },
        {
          type: QuestionTypeMap.MULTISELECT,
          question:
            "What factors are most important to you when choosing a country or university?",
          options: [
            "Ranking",
            "Location",
            "Culture",
            "Job Opportunities",
            "Cost",
            "Other",
          ],
        },
        {
          type: QuestionTypeMap.TEXT,
          question: "What course or program are you planning to pursue?",
        },
        {
          type: QuestionTypeMap.TEXT,
          question: "Why have you chosen this field of study?",
        },
        {
          type: QuestionTypeMap.TEXT,
          question: "What are your short-term and long-term career goals?",
        },
        {
          type: QuestionTypeMap.TEXT,
          question:
            "Do you have a preferred specialization within your chosen field?",
        },
      ],
    },
    {
      name: "Financial Planning and Work Experience",
      questions: [
        {
          type: QuestionTypeMap.TEXT,
          question:
            "What is your estimated budget for tuition fees and living expenses?",
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Are you planning to apply for scholarships or financial aid?",
          options: ["Yes", "No", "Not sure"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Do you have any sponsors or family support for your education abroad?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Are you open to part-time work during your studies to support yourself?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question: "Have you explored education loan options?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question: "Do you have any savings set aside for your studies?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Do you have any work experience (full-time, part-time, internships)?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.TEXT,
          question:
            "How does your work experience align with your chosen field of study?",
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Are you planning to gain work experience in your target country after graduation?",
          options: ["Yes", "No", "Maybe"],
        },
      ],
    },
    {
      name: "Language, Hobbies, and Cultural Adaptability",
      questions: [
        {
          type: QuestionTypeMap.TEXT,
          question: "What languages are you fluent in?",
        },
        {
          type: QuestionTypeMap.MULTISELECT,
          question:
            "Have you taken any language proficiency tests (e.g., IELTS, TOEFL, PTE)?",
          options: ["IELTS", "TOEFL", "PTE", "None"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Are you comfortable studying in a non-English speaking country?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.TEXT,
          question: "What are your hobbies or extracurricular activities?",
        },
        {
          type: QuestionTypeMap.TEXT,
          question:
            "Have you participated in any competitions, clubs, or volunteer work?",
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Do you plan to continue these activities while studying abroad?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question: "Have you lived away from home before?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.TEXT,
          question:
            "How do you plan to adapt to a new culture and environment?",
        },
      ],
    },
    {
      name: "Visa, Immigration, and Post-Study Plans",
      questions: [
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Are you aware of the visa requirements for your target country?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Have you started preparing the necessary documents (e.g., financial statements, acceptance letters)?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Do you plan to return to India after completing your studies, or would you like to settle abroad?",
          options: ["Return to India", "Settle Abroad", "Undecided"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Are you aware of the post-study work visa policies in your target country?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Do you have any health conditions that require special attention?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Are you aware of the health insurance requirements in your target country?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question: "Does your family support your decision to study abroad?",
          options: ["Yes", "No", "Partially"],
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Do you have any relatives or friends in your target country?",
          options: ["Yes", "No"],
        },
        {
          type: QuestionTypeMap.TEXT,
          question: "When do you plan to start your studies?",
        },
        {
          type: QuestionTypeMap.SELECT,
          question:
            "Have you started the application process, or do you need guidance?",
          options: ["Started", "Need Guidance"],
        },
        {
          type: QuestionTypeMap.TEXT,
          question: "What are your biggest concerns about studying abroad?",
        },
        {
          type: QuestionTypeMap.TEXT,
          question:
            "What do you expect from us as your study abroad counselor?",
        },
      ],
    },
  ],
};
const totalSteps = transformedQuestionSet.sets.length;

const makeQuestionAnswersObject = (): QuestionsSets => {
  return transformedQuestionSet.sets.map((set) => {
    const questionAnswers = set.questions.map((question) => {
      if (question.type === QuestionTypeMap.MULTISELECT) {
        return {
          ...question,
          answer: [],
        };
      }
      return {
        ...question,
        answer: "",
      };
    });
    return {
      name: set.name,
      questions: questionAnswers,
    };
  });
};

const formNames = transformedQuestionSet.sets.map((set) => set.name);

const handleFormSubmitAPICall = async (data: QuestionsSets, email: string) => {
  const response = await fetchWithTimeout(
    `${apiEndPoint}${apiPath.preCounsellingForm}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        email,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.success) {
    console.log("@@ fetch response is unsuccessful.");
    return {
      notFound: true,
    };
  }
  return response.data;
};

export const getServerSideProps = () => {
  return {
    props: {
      data: makeQuestionAnswersObject(),
    },
  };
};

const handleFetchingFormDataFromLocalStorage = async (
  callback: (data: QuestionsSets) => void,
  userEmail: string
) => {
  try {
    const formDataFromLocalStorage = localStorage.getItem(
      "pre-counselling-form"
    );
    // Ensure there is valid data before parsing
    if (!formDataFromLocalStorage) return;

    const parsedData: { email: string; formData: QuestionsSets } =
      await JSON.parse(formDataFromLocalStorage);
    if (parsedData && parsedData.email === userEmail) {
      callback(parsedData.formData);
    }
  } catch (error) {
    console.error("Error parsing form data from local storage:", error);
  }
};

export default function PreCounsellingForm({ data }: { data: QuestionsSets }) {
  const { user, fetchUserDetails } = useUserSession();
  const [formData, updateFormData] = useState<QuestionsSets>(data);
  const [currentStep, updateCurrentStep] = useState<number>(0);
  const [apiStatus, updateAPIStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const navigation = useRouter();

  const isEveryQuestionAnswered = true; // for testing
  // const isEveryQuestionAnswered = formData[currentStep]?.questions.every(
  //   (question) => {
  //     if (question.type === QuestionTypeMap.MULTISELECT) {
  //       return question.answer.length > 0;
  //     }
  //     return question.answer.length >= 2;
  //   }
  // );

  const handleFormSubmit = async () => {
    updateAPIStatus("loading");
    const response = await handleFormSubmitAPICall(formData, user?.email || "");
    if (response.success) {
      updateAPIStatus("success");
      localStorage.removeItem("pre-counselling-form");
      fetchUserDetails();
      navigation.push("/dashboard");
    } else {
      updateAPIStatus("error");
      alert("Error in submitting the form. Please try again later.");
    }
  };

  const dataForDumping = { email: user?.email, formData };

  const saveFormDataLocally = () => {
    if (
      formChangesDetected &&
      localStorage.getItem("pre-counselling-form") !==
        JSON.stringify(dataForDumping)
    ) {
      localStorage.setItem(
        "pre-counselling-form",
        JSON.stringify(dataForDumping)
      );
      formChangesDetected = false;
    } else {
      console.log("@@ formData not stored as there is no change.");
    }
  };

  const nextStep = () => {
    if (currentStep <= totalSteps - 1 && !isEveryQuestionAnswered) {
      alert(
        "Please consider answering all the questions before proceeding to the next part. Answers should have at least 2 characters."
      );
      return;
    }
    updateCurrentStep((prev) => {
      if (prev === totalSteps) {
        return prev;
      }
      saveFormDataLocally();
      return prev + 1;
    });
    if (currentStep === totalSteps) {
      handleFormSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      updateCurrentStep(currentStep - 1);
    }
  };

  const onChangeFormDataChangeHandler = (
    questionSetIndex: number,
    questionIndex: number,
    updatedValue: string | string[]
  ) => {
    formChangesDetected = true;
    updateFormData((prev) => {
      const formDataInfo = [...prev[questionSetIndex].questions];
      formDataInfo[questionIndex].answer = updatedValue;
      const currentStepFormData = {
        name: prev[questionSetIndex].name,
        questions: formDataInfo,
      };
      const updatedFormData = [...prev];
      updatedFormData[questionSetIndex] = currentStepFormData;
      return updatedFormData;
    });
  };

  // Upon mounting, the logic below will check if stored form exists and then will update the form data.
  useEffect(() => {
    handleFetchingFormDataFromLocalStorage(updateFormData, user?.email || "");
  }, []);

  useEffect(() => {
    // This will start an interval to save the form data locally on changes done by the user.
    const intervalId = setInterval(() => {
      saveFormDataLocally();
    }, LOCAL_STORAGE_TIME);
    return () => clearInterval(intervalId);
  }, [formData]);

  return (
    <div className="flex flex-col align-center px-4">
      <h1 className="text-center font-bold text-xl mb-4">
        Pre Counselling Form
      </h1>
      {/** Progress Bar */}
      <FormProgressBar
        totalSteps={totalSteps}
        currentStep={currentStep}
        stepNames={formNames}
      />

      {/** Current Step Form */}
      {currentStep < totalSteps ? (
        <Form
          currentStep={currentStep}
          formData={formData[currentStep]}
          onDataChange={onChangeFormDataChangeHandler}
        />
      ) : (
        <p className="text-center text-lg my-4">
          Thanks for answering all the questions. You can now submit the form.
        </p>
      )}
      {/* Form Navigation Buttons */}
      {apiStatus === "success" || apiStatus === "error" ? (
        <></>
      ) : (
        <div className="flex space-x-4 justify-center my-2">
          <button
            onClick={prevStep}
            disabled={!currentStep}
            className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50 w-40 flex flex-row items-center gap-2 justify-center"
          >
            <IoMdArrowBack />
            Previous
          </button>
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 w-40 flex flex-row items-center gap-2 justify-center"
          >
            {currentStep === totalSteps ? "Submit" : "Next"}
            <IoMdArrowForward />
          </button>
        </div>
      )}
    </div>
  );
}
