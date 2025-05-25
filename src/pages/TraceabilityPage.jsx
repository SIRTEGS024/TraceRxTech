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

const TraceabilityPage = () => {
  return (
    <>
      <HeroSection
        slides={HERO_SECTIONS.traceabilitySection}
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
        title={SECTION_HEADERS.tailored4.title}
        subTitle={SECTION_HEADERS.tailored4.subTitle}
        size={FONT.size.medium}
        cardData={IMAGE_ROW_COLUMN_CARDS.traceability}
      />
      <ComplianceOvalGrid
        title={SECTION_HEADERS.ensure2.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
        complianceOvalData={COMPLIANCE_OVAL_DATA.traceabilityCompliance}
      />
      <GradientCardsSection
        title={SECTION_HEADERS.traceability.title}
        subTitle={SECTION_HEADERS.traceability.subTitle}
        size={FONT.size.medium}
        color={FONT.color.light}
        gradientCards={GRADIENT_CARDS_DATA.traceability}
      />
      <ProcessSection
        title={SECTION_HEADERS.foodSystem.title}
        subTitle={SECTION_HEADERS.foodSystem.subTitle}
        processData={FARMING_DETAILS.responsibleFoodSystem}
      />
      <TestimonialCarousel
        textImageCarousel={TEXT_IMAGE_CAROUSEL.traceabilitySection}
        title={SECTION_HEADERS.trust.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <TextImage {...TEXT_IMAGE.traceabilitySection} />
      <BlueSection {...BLUE_SECTION.traceabilitySection} />
    </>
  );
};

export default TraceabilityPage;