import { Form } from "./Form";

export const BlogsListingLayout = ({
  title,
  LeftSideElement,
  children,
}: {
  title: string;
  LeftSideElement: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="gap-2 pt-4 pb-8">
      <h1 className="text-2xl text-center font-semibold pt-3 pb-10 px-3 md:font-bold md:text-3xl">
        {title}
      </h1>
      <div className="flex flex-col justify-center md:flex-row mx-auto gap-4">
        {/* Left - Table of Contents */}
        <aside className="pr-2 md:border-r md:border-gray-200">
          <div className="md:sticky md:top-20">{LeftSideElement}</div>
        </aside>

        {/* Center - Blog Content */}
        <main className="w-full md:w-[900px]">{children}</main>

        {/* Right - Form */}
        <aside className="w-full md:w-[350px]">
          <div className="md:sticky md:top-20">
            <Form />
          </div>
        </aside>
      </div>
    </div>
  );
};
