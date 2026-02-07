import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <section className="text-center space-y-4">
        <p className="text-xl text-gray-600">
          Your Trusted Higher Education Fulfillment Partner
        </p>
        <h1 className="text-4xl font-bold">About Us</h1>
        <Image
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4"
          alt="about team abroadkart journey & vision"
          width={1000}
          height={300}
          priority
          className="mx-auto"
        />
        <h2 className="text-2xl font-semibold pt-4">
          Empowering Ambitious Students with Technology & AI
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto text-justify">
          Welcome to AbroadKart, a Delhi, India-based Higher Education
          Fulfillment company dedicated to guiding students through every step
          of their study abroad journey. With cutting-edge technology and
          AI-driven solutions, we simplify the complex process of international
          education, ensuring that students achieve their dreams with
          confidence.
        </p>
        <h2 className="text-2xl font-semibold pt-4">
          One-Stop Solution for Studying Abroad
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto text-justify">
          We provide a comprehensive suite of services tailored to students who
          aspire to study at top universities worldwide. Our expert guidance and
          technology-driven approach help students navigate through:
        </p>
        <ul className="text-left text-lg list-disc pl-4">
          <li>
            <strong>Personalized Counselling:</strong> Expert guidance to align
            education choices with career goals.
          </li>
          <li>
            <strong>University & Course Selection:</strong> AI-powered
            recommendations based on academic profile and preferences.
          </li>
          <li>
            <strong>Test Preparation:</strong> Comprehensive support for exams
            like IELTS, TOEFL, GRE, GMAT, and SAT.
          </li>
          <li>
            <strong>Fee Financing & Scholarships:</strong> Helping students
            secure the best financial aid and funding options.
          </li>
          <li>
            <strong>Visa & Immigration Support:</strong> Step-by-step assistance
            for hassle-free visa processing.
          </li>
          <li>
            <strong>Relocation & Accommodation Assistance:</strong> Helping
            students settle comfortably in their new country.
          </li>
          <li>
            <strong>Post-Migration Support:</strong> Guidance on internships,
            job placements, and local adaptation.
          </li>
        </ul>
        <h2 className="text-2xl font-semibold pt-4">Why Choose Us?</h2>
        <ul className="text-left text-lg list-disc pl-4">
          <li>
            <strong>AI-Powered Guidance:</strong> Our advanced technology
            ensures personalized university recommendations and real-time
            application tracking.
          </li>
          <li>
            <strong>Experienced Counsellors:</strong> A team of industry experts
            and education consultants dedicated to helping students make
            informed decisions.
          </li>
          <li>
            <strong>End-to-End Support:</strong> From the first counselling
            session to landing in your dream university, we handle it all.
          </li>
          <li>
            <strong>Global Network:</strong> Partnerships with top universities
            and financial institutions to provide seamless support.
          </li>
        </ul>
        <h2 className="text-2xl font-semibold pt-4">Our Vision</h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto text-justify">
          We envision a world where every student has access to the right
          education opportunities, regardless of their background. By leveraging
          technology and a student-first approach, we strive to bridge the gap
          between ambition and success.
        </p>
        <h2 className="text-2xl font-semibold pt-4">
          Get Started with Us Today!
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto text-justify">
          Your study abroad journey begins here! Connect with our expert
          counsellors and take the first step toward achieving your dreams.
          Whether you need{" "}
          <strong>
            guidance on course selection, financial aid, visa applications, or
            post-migration support
          </strong>
          , we are here to help.
        </p>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto text-justify">
          Follow us on [Instagram] [YouTube] [LinkedIn] to stay updated with the
          latest study abroad insights!
        </p>
      </section>
    </div>
  );
}
