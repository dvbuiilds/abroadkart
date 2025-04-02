import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@app/components/ui/accordion";
import { FaUniversity } from "react-icons/fa";
import { FaGlobe, FaUserGraduate } from "react-icons/fa6";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import {
  BookOpenCheck,
  CheckCircle,
  GraduationCap,
  Headset,
  School,
  Smile,
} from "lucide-react";
import HeaderImg from "../../public/abroadkart-services.png";
import { BlogCard } from "@app/components/BlogCard";
import { Form } from "@app/components/BlogTemplates/Template1/Form";

const metrics = [
  {
    icon: <FaGlobe size={30} />,
    value: "20+",
    text: "Countries Covered",
  },
  {
    icon: <FaUserGraduate size={30} />,
    value: "100+",
    text: "Courses Enrolled",
  },
  {
    icon: <FaUniversity size={30} />,
    value: "500+",
    text: "Partner Universities",
  },
];
const howItWorksSteps = [
  {
    title: "Sign Up & Fill Form",
    description: "Join for free and complete the Pre-Counselling form.",
    Icon: <CheckCircle className="text-blue-600 h-12 w-12" />,
  },
  {
    title: "One-on-One Consultation",
    description: "Discuss your higher education goals with our experts.",
    Icon: <Headset className="text-blue-600 h-12 w-12" />,
  },
  {
    title: "Choose Your Counsellor",
    description: "Select the best mentor aligned with your aspirations.",
    Icon: <Smile className="text-blue-600 h-12 w-12" />,
  },
  {
    title: "Shortlist Universities",
    description: "Begin your study abroad journey with college selection.",
    Icon: <School className="text-blue-600 h-12 w-12" />,
  },
  {
    title: "Prepare for Entrance & Scholarships",
    description: "Get expert guidance for exams and scholarships.",
    Icon: <GraduationCap className="text-blue-600 h-12 w-12" />,
  },
  {
    title: "Visa & Accommodation Assistance",
    description: "While you pack, we handle your visa and stay arrangements.",
    Icon: <BookOpenCheck className="text-blue-600 h-12 w-12" />,
  },
];
const blogs = [
  {
    pageId: "top-10-universities",
    title: "Top 10 Universities in the UK",
    date: "March 15, 2025",
    imgUrl: "/uk-universities.jpg",
  },
  {
    pageId: "top-10-universities",
    title: "How to Get a Student Visa for the USA",
    date: "March 10, 2025",
    imgUrl: "/usa-visa.jpg",
  },
  {
    pageId: "top-10-universities",
    title: "Best Countries for Studying AI & Data Science",
    date: "March 5, 2025",
    imgUrl: "/ai-study.jpg",
  },
];
const faqs = [
  {
    id: 1,
    question: "How does AbroadKart connect me with counsellors?",
    answer:
      "AbroadKart uses a sophisticated matching algorithm that considers your academic background, target destinations, budget, and specific requirements to connect you with the most compatible counsellors from our extensive network of verified education experts.",
  },
  {
    id: 2,
    question: "What qualifications do your counsellors have?",
    answer:
      "All counsellors on our platform are thoroughly vetted professionals with a minimum of 5 years of experience in international education consulting. Many hold advanced degrees in education or related fields and have successful track records of placing students in top universities worldwide.",
  },
  {
    id: 3,
    question: "How much does it cost to use AbroadKart?",
    answer:
      "Creating an account and browsing counsellor profiles on AbroadKart is completely free. You only pay for the specific counselling services you choose to book, with transparent pricing displayed on each counsellor's profile. We offer packages ranging from one-time consultations to comprehensive application support.",
  },
  {
    id: 4,
    question: "Can I get help with scholarship applications?",
    answer:
      "Absolutely! Many of our counsellors specialize in identifying scholarship opportunities and guiding students through the application process. They can help you find scholarships that match your profile and assist in crafting compelling applications to increase your chances of success.",
  },
  {
    id: 5,
    question: "Is AbroadKart available for students from any country?",
    answer:
      "Yes, AbroadKart serves students globally. Our platform connects students from around the world with international education experts who can provide guidance regardless of your current location or destination interests.",
  },
  {
    id: 6,
    question: "What if I'm not satisfied with my counsellor?",
    answer:
      "Your satisfaction is our priority. If you're not completely satisfied with your initial session, you can request a match with a different counsellor. We also offer a satisfaction guarantee for our premium packages, ensuring you receive the quality guidance you deserve.",
  },
];

const Home = () => {
  return (
    <div className="w-full mx-auto">
      {/* Header Section */}
      <header className="bg-white text-gray-900 pb-16 md:pt-8 w-full">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center">
          {/* Chip */}
          <div className="mt-4 inline-block bg-blue-600/10 text-blue-600 font-semibold px-4 py-2 rounded-full text-sm mb-6">
            Your Journey to Global Education Begins Here
          </div>
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Study Abroad Counselling – Your Future Starts Here
          </h1>

          {/* Content Layout */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Description & Metrics */}
            <div className="flex flex-col items-center">
              <Image
                src={HeaderImg}
                alt="AbroadKart's services to meet all study abroad needs"
                width={420}
                height={360}
                priority
                className="mb-4 w-auto h-auto"
              />
              <p className="text-lg leading-relaxed text-justify">
                Connect with experienced counsellors who will guide you through
                every step of your international education journey, from
                university selection to visa approval.
              </p>
              {/* Metrics */}
              <div className="mt-8 flex flex-wrap gap-1 justify-around w-full">
                {metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center w-28 h-28 md:w-36 md:h-36 bg-gray-100 text-blue-600 rounded-full shadow-md p-6"
                  >
                    {metric.icon}
                    <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
                    <p className="text-sm text-center">{metric.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Free Counselling Form */}
            <Form />
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="bg-gray-100 px-4 py-16">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-bold text-center mb-2">How It Works</h2>
          <p className="text-justify mb-8">
            Step-by-Step Guide to Your Study Abroad Journey – From Counselling
            to Campus!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorksSteps.map((step, index) => (
              <Card key={index} className="shadow-md flex flex-col p-4 gap-4">
                <CardHeader className="flex items-center gap-4 space-x-2 p-0">
                  {step.Icon}
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600 text-justify p-0">
                  {step.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white text-center px-4">
        <h2 className="text-2xl font-semibold">Ready to Begin Your Journey?</h2>
        <p className="mt-2">
          Start with a free counselling session and take the first step toward
          your dream university.
        </p>
        <Link href="#counselling-form">
          <button
            className="mt-6 bg-white hover:bg-gray-200 text-blue-600 font-semibold py-2 rounded-lg px-6"
            onClick={() => {
              const element = document.getElementById("counselling-form");
              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }}
          >
            Get Free Counselling
          </button>
        </Link>
      </section>

      {/* Blog Section */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center">
            Latest Blogs
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <BlogCard key={`blog_${index}_${blog.pageId}`} data={blog} />
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/blogs" className="text-blue-600 hover:underline">
              Explore More Blogs &gt;
            </Link>
          </div>
        </div>
      </section>

      {/** FAQs */}
      <section className="section-padding bg-counselor-light py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Find answers to the most common questions about our platform and
              services.
            </p>
          </div>

          <div className="w-xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={`item-${faq.id}`}
                  className="bg-white my-4 rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors">
                    <span className="text-left font-medium text-lg">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-2">
                    <p className="text-gray-600">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
