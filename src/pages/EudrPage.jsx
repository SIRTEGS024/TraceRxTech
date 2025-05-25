import BlueSection from "../components/BlueSection";
import ComplianceCardGrid from "../components/ComplianceCardGrid";
import ComplianceForm from "../components/ComplianceForm";
import ComplianceOvalGrid from "../components/ComplianceOvalGrid";
import HeroSection from "../components/HeroSection";
import ImageRowColumnCardSection from "../components/ImageRowColumnCardSection";
import ProcessSection from "../components/ProcessSection";
import TestimonialCarousel from "../components/TestimonialCarousel";
import TextImage from "../components/TextImage";
import TrustedCompanies from "../components/TrustedCompany";
import {
  HERO_SECTIONS,
  COMPANY_LOGOS_CAROUSEL,
  SECTION_HEADERS,
  FONT,
  IMAGE_ROW_COLUMN_CARDS,
  COMPLIANCE_OVAL_DATA,
  COMPLIANCE_CARD_DATA,
  FARMING_DETAILS,
  TEXT_IMAGE_CAROUSEL,
  TEXT_IMAGE,
  BLUE_SECTION,
} from "../constants";

const EudrPage = () => {
  return (
    <>
      <HeroSection
        slides={HERO_SECTIONS.eudrSection}
        size={FONT.size.xLarge}
        color={FONT.color.light}
      />
      <TrustedCompanies
        companyLogos={COMPANY_LOGOS_CAROUSEL.companies}
        title={SECTION_HEADERS.join.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <ImageRowColumnCardSection
        title={SECTION_HEADERS.tailored.title}
        subTitle={SECTION_HEADERS.tailored.subTitle}
        size={FONT.size.medium}
        cardData={IMAGE_ROW_COLUMN_CARDS.eudr}
      />
      <ComplianceForm />
      <ComplianceOvalGrid
        title={SECTION_HEADERS.ensure.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
        complianceOvalData={COMPLIANCE_OVAL_DATA.eudrCompliance}
      />
      <ComplianceCardGrid
        title={SECTION_HEADERS.emmisions.title}
        subTitle={SECTION_HEADERS.emmisions.subTitle}
        size={FONT.size.medium}
        color={FONT.color.light}
        complianceCardData={COMPLIANCE_CARD_DATA.eudrSection}
      />
      <ProcessSection
        title={SECTION_HEADERS.solutions.title}
        subTitle={SECTION_HEADERS.solutions.subTitle}
        processData={FARMING_DETAILS.preHarvest}
      />
      <ProcessSection processData={FARMING_DETAILS.postHarvest} />
      <ProcessSection processData={FARMING_DETAILS.dueDiligenceReporting} />
      <TestimonialCarousel
        textImageCarousel={TEXT_IMAGE_CAROUSEL.eudrSection}
        title={SECTION_HEADERS.trust.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <TextImage {...TEXT_IMAGE.eudrSection} />
      <BlueSection {...BLUE_SECTION.eudrSection} />
    </>
  );
};

export default EudrPage;
