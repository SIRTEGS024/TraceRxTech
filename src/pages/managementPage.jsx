import BlueSection from "../components/BlueSection";
import ComplianceOvalGrid from "../components/ComplianceOvalGrid";
import GradientCardsSection from "../components/GradientCardsSection";
import HeroSection from "../components/HeroSection";
import ImageRowColumnCardSection from "../components/ImageRowColumnCardSection";
import ProcessSection from "../components/ProcessSection";
import TestimonialCarousel from "../components/TestimonialCarousel";
import TextImage from "../components/TextImage";
import TrustedCompanies from "../components/TrustedCompany";
import {
  COMPANY_LOGOS_CAROUSEL,
  HERO_SECTIONS,
  SECTION_HEADERS,
  FONT,
  IMAGE_ROW_COLUMN_CARDS,
  COMPLIANCE_OVAL_DATA,
  GRADIENT_CARDS_DATA,
  FARMING_DETAILS,
  TEXT_IMAGE_CAROUSEL,
  TEXT_IMAGE,
  BLUE_SECTION,
} from "../constants";

const ManagementPage = () => {
  return (
    <>
      <HeroSection
        slides={HERO_SECTIONS.managementSection}
        size={FONT.size.large}
        color={FONT.color.light}
      />
      <TrustedCompanies
        companyLogos={COMPANY_LOGOS_CAROUSEL.companies}
        title={SECTION_HEADERS.join.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <ImageRowColumnCardSection
        title={SECTION_HEADERS.tailored5.title}
        size={FONT.size.medium}
        subTitle={SECTION_HEADERS.tailored5.subTitle}
        cardData={IMAGE_ROW_COLUMN_CARDS.management}
      />
      <ComplianceOvalGrid
        title={SECTION_HEADERS.manage.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
        complianceOvalData={COMPLIANCE_OVAL_DATA.managementCompliance}
      />
      <GradientCardsSection
        title={SECTION_HEADERS.promote.title}
        subTitle={SECTION_HEADERS.promote.subTitle}
        size={FONT.size.medium}
        color={FONT.color.light}
        gradientCards={GRADIENT_CARDS_DATA.management}
      />
      <ProcessSection
        title={SECTION_HEADERS.responsibility.title}
        subTitle={SECTION_HEADERS.responsibility.subTitle}
        processData={FARMING_DETAILS.environmentalResponsibility}
      />
      <TestimonialCarousel
        textImageCarousel={TEXT_IMAGE_CAROUSEL.managementSection}
        title={SECTION_HEADERS.trust.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <TextImage {...TEXT_IMAGE.managementSection} />
      <BlueSection {...BLUE_SECTION.managementSection} />
    </>
  );
};

export default ManagementPage;
