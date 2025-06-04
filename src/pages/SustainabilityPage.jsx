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

const SustainabilityPage = () => {
  return (
    <>
      <HeroSection
        slides={HERO_SECTIONS.sustainabilitySection}
        size={FONT.size.xLarge}
        color={FONT.color.light}
      />
      {/* <TrustedCompanies
        companyLogos={COMPANY_LOGOS_CAROUSEL.companies}
        title={SECTION_HEADERS.join.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      /> */}
      <ImageRowColumnCardSection
        title={SECTION_HEADERS.tailored3.title}
        subTitle={SECTION_HEADERS.tailored3.subTitle}
        size={FONT.size.medium}
        cardData={IMAGE_ROW_COLUMN_CARDS.sustainability}
      />
      <ComplianceOvalGrid
        title={SECTION_HEADERS.aligning.title}
        subTitle={SECTION_HEADERS.aligning.subTitle}
        size={FONT.size.medium}
        color={FONT.color.dark}
        complianceOvalData={COMPLIANCE_OVAL_DATA.sustainabilityCompliance}
      />
      <GradientCardsSection
        title={SECTION_HEADERS.cultivating.title}
        subTitle={SECTION_HEADERS.cultivating.subTitle}
        size={FONT.size.medium}
        color={FONT.color.light}
        gradientCards={GRADIENT_CARDS_DATA.sustainability}
      />
      <ProcessSection
        title={SECTION_HEADERS.transformation.title}
        subTitle={SECTION_HEADERS.transformation.subTitle}
        processData={FARMING_DETAILS.sustainableTransformation}
      />
      <TestimonialCarousel
        textImageCarousel={TEXT_IMAGE_CAROUSEL.sustainabilitySection}
        title={SECTION_HEADERS.trust.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <TextImage {...TEXT_IMAGE.sustainabilitySection} />
      <BlueSection {...BLUE_SECTION.sustainabilitySection} />
    </>
  );
};

export default SustainabilityPage;
