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

const MrvPage = () => {
  return (
    <>
      <HeroSection
        slides={HERO_SECTIONS.mrvSection}
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
        title={SECTION_HEADERS.tailored2.title}
        subTitle={SECTION_HEADERS.tailored2.subTitle}
        size={FONT.size.medium}
        cardData={IMAGE_ROW_COLUMN_CARDS.mrv}
      />
      <ComplianceOvalGrid
        title={SECTION_HEADERS.ensure.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
        complianceOvalData={COMPLIANCE_OVAL_DATA.mrvCompliance}
      />
      <GradientCardsSection
        title={SECTION_HEADERS.fight.title}
        subTitle={SECTION_HEADERS.fight.subTitle}
        size={FONT.size.medium}
        color={FONT.color.light}
        gradientCards={GRADIENT_CARDS_DATA.mrv}
      />
      <ProcessSection
        title={SECTION_HEADERS.platform.title}
        subTitle={SECTION_HEADERS.platform.subTitle}
        processData={FARMING_DETAILS.marketIntegrity}
      />
      <TestimonialCarousel
        textImageCarousel={TEXT_IMAGE_CAROUSEL.mrvSection}
        title={SECTION_HEADERS.trust.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <TextImage {...TEXT_IMAGE.mrvSection} />
      <BlueSection {...BLUE_SECTION.mrvSection} />
    </>
  );
};

export default MrvPage;
