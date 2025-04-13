import { useState } from "react";
import { IoClose } from "react-icons/io5";

interface AlertProps {
  message: string;
  type: "success" | "warning" | "error" | "info";
}

const alertColors = {
  success: "bg-green-100 border-green-500 text-green-700",
  warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
  error: "bg-red-100 border-red-500 text-red-700",
  info: "bg-blue-100 border-blue-500 text-blue-700",
};

export const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className={`w-full p-3 border-l-4 rounded-md ${alertColors[type]} flex justify-between items-start`}
    >
      <span>{message}</span>
      <button onClick={() => setIsVisible(false)} className="ml-2">
        <IoClose size={20} />
      </button>
    </div>
  );
};
