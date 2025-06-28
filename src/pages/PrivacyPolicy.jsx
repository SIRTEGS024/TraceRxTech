import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PRIVACY_SECTION } from "../constants";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const observerRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      root: null, // Use viewport as root
      rootMargin: "-100px 0px -50% 0px", // Adjust for navbar and center visibility
      threshold: 0.1, // Trigger when 10% of section is visible
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, observerOptions);

    PRIVACY_SECTION.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 mt-3">
          <h1 className="text-4xl font-bold text-emerald-700 mb-8">Privacy Policy</h1>

          <section id="introduction" className="mb-12">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              TraceRxTech is committed to protecting your personal data and respecting your privacy across all its websites.
              This privacy policy outlines how TraceRxTech handles the processing of personal data. You can browse most of our websites without providing any personal data.
              In certain cases, your personal data may be required to provide a service. When personal data is required, you can find detailed information in a specific privacy statement linked to the relevant service or website. You will find contact details for the relevant service in that specific privacy statement.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              In this respect:
            </p>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
              <li>A data controller ensures compliance with the specific privacy statement for each service.</li>
              <li>TraceRxTech’s data protection team oversees the internal application of data protection practices and advises on compliance obligations.</li>
            </ul>
          </section>

          <section id="specific-privacy-statement" className="mb-12">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-4">Information Contained in a Specific Privacy Statement</h2>
            <p className="text-gray-600 leading-relaxed">
              When visiting TraceRxTech websites or using our services, further specific privacy statements will contain the following information about the use of your personal data:
            </p>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
              <li>The purposes of the processing and how your personal data is processed.</li>
              <li>The legal grounds for processing your personal data.</li>
              <li>Which personal data is collected and further processed.</li>
              <li>How long it is kept.</li>
              <li>How it is protected and safeguarded.</li>
              <li>Who has access to your personal data.</li>
              <li>Your rights and how you can exercise them.</li>
              <li>Who to contact if you have questions or complaints.</li>
            </ul>
          </section>

          <section id="services" className="mb-12">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-4">Services</h2>
            <p className="text-gray-600 leading-relaxed">
              A service on TraceRxTech’s websites is a resource that improves communication between users and TraceRxTech.
              TraceRxTech offers three types of services:
            </p>
            <h3 className="text-2xl font-medium text-emerald-500 mt-4 mb-2">Information Services</h3>
            <p className="text-gray-600 leading-relaxed">
              Provide easy and effective access to information.
            </p>
            <h3 className="text-2xl font-medium text-emerald-500 mt-4 mb-2">Interactive Communication Services</h3>
            <p className="text-gray-600 leading-relaxed">
              Facilitate consultations and feedback.
            </p>
            <h3 className="text-2xl font-medium text-emerald-500 mt-4 mb-2">Transaction Services</h3>
            <p className="text-gray-600 leading-relaxed">
              Enable basic transactions, such as procurement, financial operations, event enrollment, or ordering documents.
            </p>
          </section>

          <section id="analytics" className="mb-12">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-4">TraceRxTech Analytics</h2>
            <p className="text-gray-600 leading-relaxed">
              TraceRxTech Analytics is a service that measures the effectiveness and efficiency of TraceRxTech’s websites.
              You are free to refuse the use of this service via the cookie banner that appears on the first page you visit or within the TraceRxTech Analytics settings.
              Choosing not to use this service does not affect your navigation experience on TraceRxTech websites.
            </p>
          </section>

          <section id="ip-device" className="mb-12">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-4">IP Address and Device ID</h2>
            <p className="text-gray-600 leading-relaxed">
              When you access a TraceRxTech website, we receive the Internet Protocol address (IP address) or device ID of the device used as an essential technical requirement.
              Without this information, you cannot establish a technical connection between your device and TraceRxTech’s server infrastructure, preventing access to our websites.
              TraceRxTech only retains this information for the duration of your browsing session. IP addresses and device IDs may be stored for up to one year in log files for security purposes.
            </p>
          </section>

          <section id="cookies-third-parties" className="mb-12">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-4">Cookies and Third Parties</h2>
            <p className="text-gray-600 leading-relaxed">
              Some TraceRxTech websites use first-party cookies, set and controlled by TraceRxTech, not by external organizations.
              Our websites may provide links to third-party sites. To use third-party content, you may need to accept their specific terms and conditions, including their cookie policies, over which we have no control.
            </p>
          </section>

          <section id="safeguarding" className="mb-12">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-4">Safeguarding Information</h2>
            <p className="text-gray-600 leading-relaxed">
              Collected personal data is stored securely by TraceRxTech in accordance with our data protection policies.
              TraceRxTech’s contractors are bound by contractual clauses to ensure the same level of data protection and confidentiality as required by our policies.
            </p>
          </section>

          <section id="rights" className="mb-12">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-4">Your Rights as a Data Subject</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
              <li>Access your personal data held by TraceRxTech.</li>
              <li>Request rectification or erasure of your data.</li>
              <li>Request restriction of processing or object to processing, where applicable.</li>
              <li>Request data portability.</li>
              <li>Withdraw consent at any time, where processing is based on consent, without affecting the lawfulness of prior processing.</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              For requests concerning your personal data, contact the data controller identified in the specific privacy statement for the relevant service.
            </p>
          </section>
        </div>

        {/* Sticky Side Navigation */}
        <div className="lg:w-64 hidden lg:block">
          <div className="sticky top-32">
            <h3 className="text-xl font-medium text-emerald-700 mb-4">Sections</h3>
            <ul className="space-y-2">
              {PRIVACY_SECTION.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={`block py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeSection === section.id
                        ? "bg-emerald-600 text-white"
                        : "text-gray-600 hover:bg-emerald-100"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: activeSection === section.id ? 1.05 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {section.title}
                    </motion.div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;