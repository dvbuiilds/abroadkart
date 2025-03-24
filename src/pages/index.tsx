import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle, FaUniversity } from "react-icons/fa";
import { FaBookOpen, FaGlobe, FaUserCheck } from "react-icons/fa6";

const Home = () => {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="relative bg-blue-50 py-16 px-6 lg:px-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Section */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="flex gap-2 mb-4">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                500+ Universities
              </span>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                100+ Courses
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Your Journey to Study Abroad Starts Here
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Expert guidance for your dream university. Connect with top
              advisors and start with a free counselling session today!
            </p>
          </div>

          {/* Free Counselling Form */}
          <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md lg:w-1/3">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Request Free Counselling
            </h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="input-field"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="WhatsApp Number"
                className="input-field"
                required
              />
              <select className="input-field">
                <option>Select Target Country</option>
                <option>USA</option>
                <option>Canada</option>
                <option>UK</option>
              </select>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full">
                Get Free Counselling
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Metrics Section */}
      <section className="py-16 bg-blue-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why Choose Us?
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {[
              {
                number: "20+",
                text: "Countries Covered",
                icon: <FaGlobe size={32} className="text-blue-600" />,
              },
              {
                number: "100+",
                text: "Courses Enrolled",
                icon: <FaBookOpen size={32} className="text-blue-600" />,
              },
              {
                number: "500+",
                text: "Partner Universities",
                icon: <FaUniversity size={32} className="text-blue-600" />,
              },
            ].map((metric, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg p-6 w-48 h-48 flex flex-col justify-center items-center"
              >
                {metric.icon}
                <span className="text-3xl font-bold text-blue-600 mt-2">
                  {metric.number}
                </span>
                <p className="text-gray-700 text-center">{metric.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900">How It Works</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              {
                step: "Step 1",
                text: "Sign up for free onboarding",
                icon: (
                  <FaUserCheck size={40} className="text-blue-600 mx-auto" />
                ),
              },
              {
                step: "Step 2",
                text: "Fill in your academic details",
                icon: (
                  <FaCheckCircle size={40} className="text-blue-600 mx-auto" />
                ),
              },
              {
                step: "Step 3",
                text: "Speak with our experts to set your goals",
                icon: (
                  <FaUserCheck size={40} className="text-blue-600 mx-auto" />
                ),
              },
              {
                step: "Step 4",
                text: "Get a personalized counselling session",
                icon: (
                  <FaCheckCircle size={40} className="text-blue-600 mx-auto" />
                ),
              },
              {
                step: "Step 5",
                text: "Start your study abroad journey",
                icon: (
                  <FaUniversity size={40} className="text-blue-600 mx-auto" />
                ),
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white shadow-md p-6 rounded-lg text-center flex flex-col items-center"
              >
                {item.icon}
                <h3 className="text-lg font-bold text-blue-600 mt-4">
                  {item.step}
                </h3>
                <p className="text-gray-700 mt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-semibold">Ready to Begin Your Journey?</h2>
        <p className="mt-4">
          Start with a free counselling session and take the first step toward
          your dream university.
        </p>
        <Link href="#form">
          <button className="mt-6 bg-white text-blue-600 py-2 px-6 rounded-lg">
            Get Free Counselling
          </button>
        </Link>
      </section>

      {/* Blog Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center">
            Latest Blogs
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Top 10 Universities in the UK",
                date: "March 15, 2025",
                img: "/uk-universities.jpg",
              },
              {
                title: "How to Get a Student Visa for the USA",
                date: "March 10, 2025",
                img: "/usa-visa.jpg",
              },
              {
                title: "Best Countries for Studying AI & Data Science",
                date: "March 5, 2025",
                img: "/ai-study.jpg",
              },
            ].map((blog, index) => (
              <div key={index} className="bg-white shadow-md p-6 rounded-lg">
                <Image
                  src={blog.img}
                  width={300}
                  height={200}
                  alt={blog.title}
                  className="rounded-md"
                />
                <p className="text-gray-500 text-sm mt-2">{blog.date}</p>
                <h3 className="text-lg font-bold text-gray-900 mt-2">
                  {blog.title}
                </h3>
                <div className="mt-6">
                  <Link
                    href={`/blog/${blog.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full">
                      Read More
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/blog">
              <button className="bg-blue-600 text-white py-2 px-6 rounded-lg">
                Explore More Blogs
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="w-full">
      {/* Header Section */}
      <header className="relative bg-blue-50 py-16 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Study Abroad Made Simple
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Get expert guidance for your study abroad journey. Choose from
              500+ universities across 20+ countries. Start with a free
              consultation!
            </p>
          </div>
          {/* Free Counselling Form */}
          <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Request Free Counselling
            </h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="input-field"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="WhatsApp Number"
                className="input-field"
                required
              />
              <select className="input-field">
                <option>Select Target Country</option>
                <option>USA</option>
                <option>Canada</option>
                <option>UK</option>
              </select>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full">
                Get Free Counselling
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Metrics Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why Choose Us?
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {[
              { number: "20+", text: "Countries Covered" },
              { number: "100+", text: "Courses Enrolled" },
              { number: "500+", text: "Partner Universities" },
            ].map((metric, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-full p-6 w-48 h-48 flex flex-col justify-center items-center"
              >
                <span className="text-3xl font-bold text-blue-600">
                  {metric.number}
                </span>
                <p className="text-gray-700 text-center">{metric.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900">How It Works</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { step: "Step 1", text: "Sign up for free onboarding" },
              { step: "Step 2", text: "Fill in your academic details" },
              {
                step: "Step 3",
                text: "Speak with our experts to set your goals",
              },
              {
                step: "Step 4",
                text: "Get a personalized counselling session",
              },
              { step: "Step 5", text: "Start your study abroad journey" },
            ].map((item, index) => (
              <div key={index} className="bg-white shadow-md p-6 rounded-lg">
                <h3 className="text-lg font-bold text-blue-600">{item.step}</h3>
                <p className="text-gray-700 mt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-semibold">Ready to Begin Your Journey?</h2>
        <p className="mt-4">
          Start with a free counselling session and take the first step toward
          your dream university.
        </p>
        <Link href="#form">
          <button className="mt-6 bg-white text-blue-600 py-2 px-6 rounded-lg">
            Get Free Counselling
          </button>
        </Link>
      </section>

      {/* Blog Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center">
            Latest Blogs
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Top 10 Universities in the UK",
                link: "/blog/top-uk-universities",
              },
              {
                title: "How to Get a Student Visa for the USA",
                link: "/blog/usa-student-visa",
              },
              {
                title: "Best Countries for Studying AI & Data Science",
                link: "/blog/study-ai-abroad",
              },
            ].map((blog, index) => (
              <div key={index} className="bg-white shadow-md p-6 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900">
                  {blog.title}
                </h3>
                <Link href={blog.link} className="text-blue-600 mt-2 block">
                  Read More →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/blog">
              <button className="bg-blue-600 text-white py-2 px-6 rounded-lg">
                Explore More Blogs
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
  return (
    <div className="flex flex-col items-center justify-center grow bg-gray-100">
      <h1 className="text-4xl font-bold">Welcome to AbroadKart.com</h1>
      <p className="mt-4 text-lg text-gray-700">
        Your gateway to global opportunities.
      </p>
    </div>
  );
};

export default Home;
