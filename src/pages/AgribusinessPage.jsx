import BlueSection from "../components/BlueSection";
import ChooseSection from "../components/ChooseSection";
import TailoredCardSection from "../components/TailoredCardSection";
import TestimonialCarousel from "../components/TestimonialCarousel";
import TextImage from "../components/TextImage";
import TrustedCompanies from "../components/TrustedCompany";
import {
  COMPANY_LOGOS_CAROUSEL,
  SECTION_HEADERS,
  FONT,
  TEXT_IMAGE_CAROUSEL,
  TEXT_IMAGE,
  BLUE_SECTION,
  TAILORED_CARDS_DATA,
  CHOOSE_SECTION,
} from "../constants";

const AgribusinessPage = () => {
  return (
    <>
      <TextImage
        {...TEXT_IMAGE.agribusinessSection}
        light
        size={FONT.size.xLarge}
      />
      <TrustedCompanies
        companyLogos={COMPANY_LOGOS_CAROUSEL.companies}
        title={SECTION_HEADERS.join2.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <TailoredCardSection
        tailoredCards={TAILORED_CARDS_DATA.agribusinessSection}
        title={SECTION_HEADERS.empowering.title}
        subTitle={SECTION_HEADERS.empowering.subTitle}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <ChooseSection
        cardData={CHOOSE_SECTION.agribusinessSection}
        title={SECTION_HEADERS.choose.title}
      />
      <TestimonialCarousel
        textImageCarousel={TEXT_IMAGE_CAROUSEL.agribusinessSection}
        title={SECTION_HEADERS.Transformative.title}
        size={FONT.size.medium}
        color={FONT.color.dark}
      />
      <BlueSection {...BLUE_SECTION.agribusinessSection} />
    </>
  );
};

export default AgribusinessPage;
