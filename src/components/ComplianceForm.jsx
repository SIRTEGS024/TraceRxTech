import { FiUser, FiArrowRight } from "react-icons/fi";
import ReusableInput from "./ReusableInput";
import { SECTION_HEADERS } from "../constants";
import { FONT } from "../constants";
import TitleSubtext from "./TitleSubtext";

const ComplianceForm = () => {
  return (
    <>
      <TitleSubtext
        title={SECTION_HEADERS.compliance.title}
        size={FONT.size.small}
        color={FONT.color.dark}
      />

      <div className="bg-white py-12 px-6 md:px-12 flex flex-col md:flex-row items-stretch justify-between gap-10 max-w-7xl mx-auto">
        {/* Text Group */}
        <div className="max-w-xl text-black space-y-4">
          <h2 className="text-lg font-bold text-green-800">
            Find Out If Your Business Is EUDR-Ready in Minutes!
          </h2>
          <p className="text-gray-700">
            Answer a few quick questions and get a personalized compliance report!
          </p>
          <p className="mt-6 font-medium text-gray-800">What You’ll Get:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>
              <span className="font-bold">Compliance Score</span> – Know where you stand!
            </li>
            <li>
              <span className="font-bold">Exclusive EUDR Checklist</span> – A free resource to guide your next steps.
            </li>
            <li>
              <span className="font-bold">Free Strategy Call</span> – Schedule a Session with us
            </li>
          </ul>
        </div>

        {/* Form Group */}
        <div className="bg-green-50 p-8 w-full max-w-xl flex flex-col justify-center gap-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <ReusableInput
              placeholder="First Name"
              icon={FiUser}
              variant="black"
            />
            <ReusableInput placeholder="Last Name" variant="black" />
          </div>

          <div className="w-full flex justify-end">
            <button className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 transition">
              Get My Report
              <FiArrowRight className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplianceForm;
