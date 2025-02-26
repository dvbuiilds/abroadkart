import { FaCheck } from "react-icons/fa6";

export const FilledCircle = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center gap-1">
    <div className="size-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
      <FaCheck />
    </div>
    <p className="text-xs text-black text-center w-20">{label}</p>
  </div>
);

export const UnFilledNumberedCircle = ({
  step,
  label,
}: {
  step: number;
  label: string;
}) => (
  <div className="flex flex-col items-center justify-center gap-1">
    <div className="size-8 border-2 border-gray-400 rounded-full flex items-center justify-center text-gray-500">
      {step}
    </div>
    <p className="text-xs text-black text-center w-20">{label}</p>
  </div>
);

export const CurrentNumberedCircle = ({
  step,
  label,
}: {
  step: number;
  label: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="size-8 border-2 border-blue-600 rounded-full flex items-center justify-center text-blue-600">
        {step}
      </div>
      <p className="text-xs text-black text-center w-20">{label}</p>
    </div>
  );
};

export const FilledBar = ({ filled }: { filled: boolean }) => {
  if (filled) {
    return <div className="w-16 h-1 bg-blue-600 rounded mt-4" />;
  }
  return <div className="w-16 h-1 bg-gray-400 rounded mt-4" />;
};
