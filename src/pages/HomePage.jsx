import BlueSection from "../components/BlueSection";
import Featured from "../components/Featured";
import HeroSection from "../components/HeroSection";
import ImpactSection from "../components/ImpactSection";
import SystemCardSection from "../components/SystemCardSection";
import TestimonialCarousel from "../components/TestimonialCarousel";
import TextImage from "../components/TextImage";
import TrustedCompanies from "../components/TrustedCompany";
import { HERO_SECTIONS, SYSTEM_CARD_DATA } from "../constants";
import {
  COMPANY_LOGOS_CAROUSEL,
  HOME_PLATFORM_CARDS,
  CONTENT_SECTIONS,
  TEXT_IMAGE_CAROUSEL,
  TEXT_IMAGE,
  COMPANY_LOGOS,
  SECTION_HEADERS,
  BLUE_SECTION,
  FONT,
} from "../constants";

const HomePage = () => {
  return (
    <>
      <HeroSection
        slides={HERO_SECTIONS.homeSection}
        size={FONT.size.large}
        color={FONT.color.light}
      />
      <SystemCardSection
        title={SECTION_HEADERS.system.title}
        subTitle={SECTION_HEADERS.system.subTitle}
        systemData ={SYSTEM_CARD_DATA}
      />
      <TrustedCompanies
        companyLogos={COMPANY_LOGOS_CAROUSEL.companies}
        title={SECTION_HEADERS.join.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <ImpactSection
        platforms={HOME_PLATFORM_CARDS}
        contentSection={CONTENT_SECTIONS}
        title={SECTION_HEADERS.drive.title}
        subTitle={SECTION_HEADERS.drive.subTitle}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <TestimonialCarousel
        textImageCarousel={TEXT_IMAGE_CAROUSEL.homeSection}
        title={SECTION_HEADERS.trust.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <TextImage {...TEXT_IMAGE.homeSection} />
      <Featured
        companyLogos={COMPANY_LOGOS.homeSectionFeatured}
        title={SECTION_HEADERS.featured.title}
      />
      <Featured
        companyLogos={COMPANY_LOGOS.homeSectionSupportedBy}
        title={SECTION_HEADERS.supported.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <BlueSection {...BLUE_SECTION.homeSection} />
    </>
  );
};

export default HomePage;
