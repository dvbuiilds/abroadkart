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
    <div className="flex flex-col items-center justify-center gap-2 pt-4 pb-8">
      <h1 className="text-2xl font-semibold py-3 md:pt-3 md:pb-10 px-3 md:font-bold md:text-3xl">
        {title}
      </h1>
      <div className="flex flex-col justify-center md:flex-row mx-auto gap-4">
        {/* Left - Table of Contents */}
        <aside className="pb-4 md:pb-0 md:pr-2 border-b md:border-r md:border-b-0 md:border-gray-200">
          <div className="md:sticky md:top-20">{LeftSideElement}</div>
        </aside>

        {/* Center - Blog Content */}
        <main className="flex-1 min-w-0">{children}</main>

        {/* Right - Form */}
        <aside className="w-full md:w-[350px]">
          <Form />
        </aside>
      </div>
    </div>
  );
};
