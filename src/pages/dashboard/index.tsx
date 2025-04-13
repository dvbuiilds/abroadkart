import Link from "next/link";
import { Alert } from "@app/components/Alert";
import { useUserSession } from "@app/context/UserSessionContext";

const Dashboard = () => {
  const { user } = useUserSession();

  if (!user?.haveFilledPreCounsellingForm) {
    return (
      <div className="flex flex-col items-center h-full gap-4 bg-white rounded-md p-1">
        <Link href="/dashboard/pre-counselling-form" className="w-full">
          <Alert
            message="Fill up this brief form and unlock free resources worth $1000."
            type="info"
          />
        </Link>
        <section className="flex flex-col gap-2 items-center">
          <h3 className="text-xl text-gray-500 font-semibold">
            Check Out Our Latest Blogs
          </h3>
          <p>
            Stay informed with helpful articles, tips, and insights on studying
            abroad.
          </p>
          <Link
            href="https://abroadkart.com"
            className="text-blue-600 hover:underline"
          >
            Explore Blogs &gt;
          </Link>
        </section>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center align-center h-full gap-4">
      <section className="flex flex-col gap-2 items-center">
        <h3 className="text-4xl text-gray-500 font-semibold">
          Thanks for filling out the form!
        </h3>
        <p className="px-16">
          Your information has been received successfully. Our team will review
          your details and will contact you shortly to understand your specific
          study abroad needs.
        </p>
        <h3 className="text-xl text-gray-500 font-semibold">
          What to Expect Next
        </h3>
        <p className="px-16">
          A member of our counselling team will reach out to you within 48 hours
          to discuss your study abroad goals and provide personalized guidance.
        </p>
      </section>
      <section className="flex flex-col gap-2 items-center">
        <h3 className="text-xl text-gray-500 font-semibold">
          Check Out Our Latest Blogs
        </h3>
        <p>
          Stay informed with helpful articles, tips, and insights on studying
          abroad.
        </p>
        <Link
          href="https://abroadkart.com"
          className="text-blue-600 hover:underline"
        >
          Explore Blogs &gt;
        </Link>
      </section>
      <section className="flex flex-col gap-2 items-center">
        Feel free to reach out to us if you have any questions or need any
        assistance. [+]91[-]9911720868 | tech.abroadkart@gmail.com
      </section>
    </div>
  );
};

export default Dashboard;
