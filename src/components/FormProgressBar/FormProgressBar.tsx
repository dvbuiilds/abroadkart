import React from "react";
import {
  CurrentNumberedCircle,
  FilledBar,
  FilledCircle,
  UnFilledNumberedCircle,
} from "./ProgressBarComponents";

export const FormProgressBar = ({
  totalSteps,
  currentStep,
  stepNames,
}: {
  totalSteps: number;
  currentStep: number;
  stepNames: string[];
}) => {
  const renderStepMarksAndBar = () => {
    const _components: React.JSX.Element[] = [];
    for (let step = 0; step < totalSteps; step++) {
      if (step < currentStep) {
        _components.push(
          <FilledCircle
            key={`progressBarItem_${step}_filledCircle`}
            label={stepNames[step]}
          />
        );
        if (step !== totalSteps - 1) {
          _components.push(
            <FilledBar
              key={`progressBarItem_${step}_filledBar`}
              filled={true}
            />
          );
        }
      } else if (step === currentStep) {
        _components.push(
          <CurrentNumberedCircle
            key={`progressBarItem_${step}_currentNumberedCircle`}
            step={step + 1}
            label={stepNames[step]}
          />
        );
        if (step !== totalSteps - 1) {
          _components.push(
            <FilledBar
              key={`progressBarItem_${step}_filledBar`}
              filled={false}
            />
          );
        }
      } else if (step > currentStep) {
        _components.push(
          <UnFilledNumberedCircle
            key={`progressBarItem_${step}_unFilledNumberedCircle`}
            step={step + 1}
            label={stepNames[step]}
          />
        );
        if (step !== totalSteps - 1) {
          _components.push(
            <FilledBar
              key={`progressBarItem_${step}_filledBar`}
              filled={false}
            />
          );
        }
      }
    }
    return _components;
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Progress Bar */}
      <div className="flex items-start flex-wrap">
        {renderStepMarksAndBar()}
      </div>
    </div>
  );
};
