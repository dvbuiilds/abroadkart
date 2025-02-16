import React from "react";

// COMPONENTS
import { FormProgressBar } from "@app/components/FormProgressBar/FormProgressBar";
import { Form } from "@app/components/Form";

// TYPES
import type { Questionnaire } from "@app/types/form-types";

// UTILS
import formData from "@app/utils/data/pre-counselling-form-questions.json";
import { useUserSession } from "@app/context/UserSessionContext";

// CONFIGS
import { apiEndPoints, apiPaths } from "@app/config/api-config";
import { useRouter } from "next/router";

const totalSteps = formData.sets.length;
const LOCAL_STORAGE_TIME = 1000 * 60;

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
  console.log("@@ Submitting the form...", data);
  const response = await fetch(
    `${apiPaths.development}${apiEndPoints.preCounsellingForm}`,
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
  console.log("@@ FORM SUBMIT response: ", responseData);
  return responseData;
};

export default function PreCounsellingForm() {
  const { user, fetchUserDetails } = useUserSession();
  const [formData, updateFormData] = React.useState<Questionnaire>(
    makeQuestionAnswersObject()
  );
  const [currentStep, updateCurrentStep] = React.useState<number>(4);
  const [apiStatus, updateAPIStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const navigation = useRouter();

  // const isEveryQuestionAnswered = true;
  const isEveryQuestionAnswered = formData[currentStep].info.every(
    (info) => info.answer.length >= 5
  );

  const handleFormSubmit = async () => {
    updateAPIStatus("loading");
    const response = await handleFormSubmitAPICall(formData, user.email);
    if (response.success) {
      updateAPIStatus("success");
      fetchUserDetails();
      navigation.push("/dashboard");
    } else {
      updateAPIStatus("error");
      alert("Error in submitting the form. Please try again later.");
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

  const disableNextButton = !isEveryQuestionAnswered;

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        localStorage.getItem("pre-counselling-form") !==
        JSON.stringify(formData)
      ) {
        localStorage.setItem("pre-counselling-form", JSON.stringify(formData));
        console.log("@@ formData stored locally.", JSON.stringify(formData));
      } else {
        console.log("@@ formData not stored as there is no change.");
      }
    }, LOCAL_STORAGE_TIME);
    return () => clearInterval(intervalId);
  }, [formData]);

  return (
    <div className="flex flex-col align-center">
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
          formData={formData[currentStep]}
          currentStep={currentStep}
          updateFormData={updateFormData}
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
