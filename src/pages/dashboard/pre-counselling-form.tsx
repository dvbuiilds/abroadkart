import { type ChangeEvent, useEffect, useState } from "react";

// COMPONENTS
import { FormProgressBar } from "@app/components/FormProgressBar/FormProgressBar";
import { Form } from "@app/components/Form";

// TYPES
import type { Questionnaire } from "@app/types/form-types";

// UTILS
import formData from "@app/utils/data/pre-counselling-form-questions.json";
import { useUserSession } from "@app/context/UserSessionContext";
import { fetchWithTimeout } from "@app/utils/fetch-utils";

// CONFIGS
import { apiEndPoints, apiPath } from "@app/config/api-config";
import { useRouter } from "next/router";

const totalSteps = formData.sets.length;
const LOCAL_STORAGE_TIME = 1000 * 30;
let formChangesDetected = false;

const makeQuestionAnswersObject = () => {
  return formData.sets.map((set) => {
    const questionAnswers = set.questions.map((question) => {
      return {
        question,
        answer: "",
      };
    });
    return {
      name: set.name,
      info: questionAnswers,
    };
  });
};

const formNames = formData.sets.map((set) => set.name);

const handleFormSubmitAPICall = async (data: Questionnaire, email: string) => {
  const response = await fetchWithTimeout(
    `${apiPath}${apiEndPoints.preCounsellingForm}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        email,
      },
      body: JSON.stringify(data),
    }
  );
  const responseData = await response.json();
  return responseData;
};

export const getServerSideProps = () => {
  return {
    props: {
      data: makeQuestionAnswersObject(),
    },
  };
};

export default function PreCounsellingForm({ data }: { data: Questionnaire }) {
  const { user, fetchUserDetails } = useUserSession();
  const [formData, updateFormData] = useState<Questionnaire>(data);
  const [currentStep, updateCurrentStep] = useState<number>(0);
  const [apiStatus, updateAPIStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const navigation = useRouter();

  // const isEveryQuestionAnswered = true; // for testing
  const isEveryQuestionAnswered = formData[currentStep].info.every(
    (info) => info.answer.length >= 5
  );

  const handleFormSubmit = async () => {
    updateAPIStatus("loading");
    const response = await handleFormSubmitAPICall(formData, user?.email || "");
    if (response.success) {
      updateAPIStatus("success");
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
    if (!isEveryQuestionAnswered) {
      alert(
        "Please consider answering all the questions before proceeding to the next part."
      );
      return;
    }
    if (currentStep < totalSteps) {
      saveFormDataLocally();
      updateCurrentStep(currentStep + 1);
      return;
    }

    handleFormSubmit();
  };

  const prevStep = () => {
    if (currentStep > 0) {
      updateCurrentStep(currentStep - 1);
    }
  };

  const onCurrentFormDataChangeHandler = (
    event: ChangeEvent<HTMLInputElement>,
    questionIndex: number
  ) => {
    formChangesDetected = true;
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

  // const disableNextButton = !isEveryQuestionAnswered;

  // Upon mounting, the logic below will check if stored form exists and then will update the form data.
  useEffect(() => {
    const formDataFromLocalStorage = localStorage.getItem(
      "pre-counselling-form"
    );
    const parsedData: { email: string; formData: Questionnaire } = JSON.parse(
      formDataFromLocalStorage || ""
    );
    if (parsedData && parsedData.email === user?.email) {
      updateFormData(parsedData.formData);
    }
  }, []);

  useEffect(() => {
    // This will start an interval to save the form data locally on changes done by the user.
    const intervalId = setInterval(() => {
      saveFormDataLocally();
    }, LOCAL_STORAGE_TIME);
    return () => clearInterval(intervalId);
  }, [formData]);

  return (
    <div className="flex flex-col align-center p-4">
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
      <div className="h-[500px] overflow-y-auto">
        {currentStep < totalSteps ? (
          <Form
            currentStep={currentStep}
            formData={formData[currentStep]}
            onDataChange={onCurrentFormDataChangeHandler}
          />
        ) : (
          <p className="text-center text-lg my-4">
            Thanks for answering all the questions. You can now submit the form.
          </p>
        )}
      </div>
      {/* Form Navigation Buttons */}
      {apiStatus === "success" || apiStatus === "error" ? (
        <></>
      ) : (
        <div className="flex space-x-4 justify-center mt-4">
          <button
            onClick={prevStep}
            disabled={!currentStep}
            className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            // disabled={disableNextButton}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {currentStep === totalSteps ? "Submit" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
