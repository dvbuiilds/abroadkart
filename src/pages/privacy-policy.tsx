import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Privacy Policy</h1>
      <p className="text-gray-700 mb-4 text-center">
        Effective Date: 30th March 2025
      </p>
      <p className="mb-4">
        Welcome to <strong>AbroadKart.com</strong> ("Company," "we," "our,"
        "us"). Your privacy is important to us. This Privacy Policy explains how
        we collect, use, disclose, and safeguard your personal information when
        you visit our website <strong>https://abroadkart.com</strong>.
      </p>

      <h2 className="text-2xl font-semibold mt-6">1. Information We Collect</h2>
      <h3 className="text-xl font-semibold mt-4">a) Personal Information</h3>
      <p>We may collect personal information that you voluntarily provide:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Full Name</li>
        <li>Email Address</li>
        <li>Phone Number (including WhatsApp number)</li>
        <li>Target Year, Country, and Course Preferences</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4">
        b) Non-Personal Information
      </h3>
      <p>We automatically collect non-identifiable information such as:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Browser type, device information, and IP address</li>
        <li>Cookies and tracking technologies</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc list-inside ml-4">
        <li>To provide personalized services</li>
        <li>To communicate with you regarding our services</li>
        <li>To send updates and promotional materials</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">
        3. How We Share Your Information
      </h2>
      <ul className="list-disc list-inside ml-4">
        <li>
          With trusted partners (universities, financial institutions, etc.)
        </li>
        <li>With service providers (hosting, email, analytics)</li>
        <li>For legal and security reasons</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">
        4. Cookies and Tracking Technologies
      </h2>
      <p>
        We use cookies to enhance user experience. You can manage cookie
        preferences in your browser settings.
      </p>

      <h2 className="text-2xl font-semibold mt-6">5. Data Security</h2>
      <p>
        We implement security measures to protect your personal data, but no
        transmission method is 100% secure.
      </p>

      <h2 className="text-2xl font-semibold mt-6">
        6. Your Rights and Choices
      </h2>
      <ul className="list-disc list-inside ml-4">
        <li>Access, update, or delete your data</li>
        <li>Opt-out of marketing communications</li>
        <li>Restrict data processing</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">7. Third-Party Links</h2>
      <p>
        We are not responsible for privacy policies of third-party websites
        linked on our site.
      </p>

      <h2 className="text-2xl font-semibold mt-6">8. Children's Privacy</h2>
      <p>
        Our services are not intended for individuals under 16. If we mistakenly
        collect data from a minor, contact us for removal.
      </p>

      <h2 className="text-2xl font-semibold mt-6">
        9. Changes to This Privacy Policy
      </h2>
      <p>
        We may update this Privacy Policy periodically. Please review it
        regularly for changes.
      </p>

      <h2 className="text-2xl font-semibold mt-6">10. Contact Us</h2>
      <p>If you have any questions, please contact us:</p>
      <ul className="list-disc list-inside ml-4">
        <li>
          <strong>AbroadKart.com</strong>
        </li>
        <li>E-11, Sector-1, Rohini, New Delhi - 110085</li>
        <li>Email: info[at]abroadkart[dot]com</li>
      </ul>
    </div>
  );
};

export default PrivacyPolicy;
