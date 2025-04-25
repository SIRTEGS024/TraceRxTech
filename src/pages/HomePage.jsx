import BlueSection from "../components/BlueSection";
import Featured from "../components/Featured";
import HeroSection from "../components/HeroSection";
import ImpactSection from "../components/ImpactSection";
import TestimonialCarousel from "../components/TestimonialCarousel";
import TextImage from "../components/TextImage";
import TrustedCompanies from "../components/TrustedCompany";
import { HERO_SECTIONS } from "../constants";
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
        {...HERO_SECTIONS.homeSection}
        size={FONT.size.large}
        color={FONT.color.light}
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
