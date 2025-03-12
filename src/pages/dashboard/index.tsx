import Link from "next/link";
import { Alert } from "@app/components/Alert";
import { useUserSession } from "@app/context/UserSessionContext";

const Dashboard = () => {
  const { user } = useUserSession();
  console.log("@@ process.env.ENVIRONMENT: ", process.env.ENVIRONMENT);

  return (
    <div className="flex items-start justify-center align-center h-full gap-4 bg-white rounded-md p-1">
      {!user?.haveFilledPreCounsellingForm ? (
        <Link href={"/dashboard/pre-counselling-form"} className="w-full">
          <Alert
            message="Fill up this brief form and unlock free resources worth $1000."
            type="info"
          />
        </Link>
      ) : null}
    </div>
  );
};

export default Dashboard;
