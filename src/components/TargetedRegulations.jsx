// components/TargetedRegulations.jsx - Complete updated file
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const TargetedRegulations = ({ isOpen, onClose, articleType }) => {
  // Define the specific article content for each tab
  const articlesContent = {
    'subject-matter': {
      title: "ARTICLE 1: TraceRX Portal Purpose & Prohibition",
      content: `TraceRX portal is a due diligence system for relevant products, as listed in Annex I of the EUDR, that contain, have been fed with or have been made using relevant commodities, namely cattle, cocoa, coffee, oil palm, rubber, soya and wood.
      
Prohibition: Article 3:
Relevant commodities and relevant products: cattle, cocoa, coffee, oil palm, rubber, soya and wood shall not be placed or made available on the market or exported, unless all the following conditions are fulfilled:
(a) they are deforestation-free;
(b) they have been produced in accordance with the relevant legislation of the country of production; and
(c) they are covered by a due diligence statement.

Undertaking:
ABD LTD shall make available to the competent authorities upon request the information, documents and data collected by TraceRX.

ABD LTD hereby declare that our product namely cattle, cocoa, coffee, oil palm, rubber, soya and wood has fulfilled all the following conditions:
(a) they are deforestation-free;
(b) they have been produced in accordance with the relevant legislation of the country of production (state/choose name of country of origin from drop box); and
(c) they are covered by a due diligence statement.

Signed for and on behalf of: ABD LTD
Date:
Name and function:
Signature:`
    },
    'eudr-definitions': {
      title: "ARTICLE 2: EUDR Definitions",
      content: `For the purposes of this Regulation, the following definitions apply:
(1) 'relevant commodities' means cattle, cocoa, coffee, oil palm, rubber, soya and wood;
(2) 'relevant products' means products listed in Annex I that contain, have been fed with or have been made using relevant commodities;
(3) 'deforestation' means the conversion of forest to agricultural use, whether human-induced or not;
(4) 'forest' means land spanning more than 0,5 hectares with trees higher than 5 metres and a canopy cover of more than 10 %, or trees able to reach those thresholds in situ, excluding land that is predominantly under agricultural or urban land use;
(5) 'agricultural use' means the use of land for the purpose of agriculture, including for agricultural plantations and set- aside agricultural areas, and for rearing livestock;
(6) 'agricultural plantation' means land with tree stands in agricultural production systems, such as fruit tree plantations, oil palm plantations, olive orchards and agroforestry systems where crops are grown under tree cover; it includes all plantations of relevant commodities other than wood; agricultural plantations are excluded from the definition of 'forest';
(7) 'forest degradation' means structural changes to forest cover, taking the form of the conversion of:
(a) primary forests or naturally regenerating forests into plantation forests or into other wooded land; or
(b) primary forests into planted forests;
(8) 'primary forest' means naturally regenerated forest of native tree species, where there are no clearly visible indications of human activities and the ecological processes are not significantly disturbed;
(9) 'naturally regenerating forest' means forest predominantly composed of trees established through natural regeneration; it includes any of the following:
(a) forests for which it is not possible to distinguish whether planted or naturally regenerated;
(b) forests with a mix of naturally regenerated native tree species and planted or seeded trees, and where the naturally regenerated trees are expected to constitute the major part of the growing stock at stand maturity;
(c) coppice from trees originally established through natural regeneration;
(d) naturally regenerated trees of introduced species;
(10) 'planted forest' means forest predominantly composed of trees established through planting and/or deliberate seeding, provided that the planted or seeded trees are expected to constitute more than 50 % of the growing stock at maturity; it includes coppice from trees that were originally planted or seeded;
(11) 'plantation forest' means a planted forest that is intensively managed and meets, at planting and stand maturity, all the following criteria: one or two species, even age class, and regular spacing; it includes short rotation plantations for wood, fibre and energy, and excludes forests planted for protection or ecosystem restoration, as well as forests established through planting or seeding, which at stand maturity resemble or will resemble naturally regenerating forests;
(12) 'other wooded land' means land not classified as 'forest' spanning more than 0,5 hectares, with trees higher than 5 metres and a canopy cover of 5 to 10 %, or trees able to reach those thresholds in situ, or with a combined cover of shrubs, bushes and trees above 10 %, excluding land that is predominantly under agricultural or urban land use;
(13) 'deforestation-free' means:
(a) that the relevant products contain, have been fed with or have been made using, relevant commodities that were produced on land that has not been subject to deforestation after 31 December, 2020; and
(b) in the case of relevant products that contain or have been made using wood, that the wood has been harvested from the forest without inducing forest degradation after 31 December, 2020;
(14) 'produced' means grown, harvested, obtained from or raised on relevant plots of land or, as regards cattle, on establishments;
(15) 'operator' means any natural or legal person who, in the course of a commercial activity, places relevant products on the market or exports them;
(16) 'placing on the market' means the first making available of a relevant commodity or relevant product on the Union market;
(17) 'trader' means any person in the supply chain other than the operator who, in the course of a commercial activity, makes relevant products available on the market;
(18) 'making available on the market' means any supply of a relevant product for distribution, consumption or use on the Union market in the course of a commercial activity, whether in return for payment or free of charge;
(19) 'in the course of a commercial activity' means for the purpose of processing, for distribution to commercial or non-commercial consumers, or for use in the business of the operator or trader itself;
(20) 'person' means a natural person, a legal person or any association of persons which is not a legal person, but which is recognised under Union or national law as having the capacity to perform legal acts;
(21) 'person established in the Union' means:
(a) in the case of a natural person, any person whose place of residence is in the Union;
(b) in the case of a legal person or an association of persons, any person whose registered office, central headquarters or a permanent business establishment is in the Union;
(22) 'authorised representative' means any natural or legal person established in the Union who, in accordance with Article 6, has received a written mandate from an operator or from a trader to act on its behalf in relation to specified tasks with regard to the operator's or the trader's obligations under this Regulation;
(23) 'country of origin' means a country or territory as referred to in Article 60 of Regulation (EU) No 952/2013;
(24) 'country of production' means the country or territory where the relevant commodity or the relevant commodity used in the production of, or contained in, a relevant product was produced;
(25) 'non-compliant products' means relevant products that do not comply with Article 3;
(26) 'negligible risk' means the level of risk that applies to relevant commodities and relevant products, where, on the basis of a full assessment of product-specific and general information, and, where necessary, of the application of the appropriate mitigation measures, those commodities or products show no cause for concern as being not in compliance with Article 3, point (a) or (b);
(27) 'plot of land' means land within a single real-estate property, as recognised by the law of the country of production, which enjoys sufficiently homogeneous conditions to allow an evaluation of the aggregate level of risk of deforestation and forest degradation associated with relevant commodities produced on that land;
(28) 'geolocation' means the geographical location of a plot of land described by means of latitude and longitude coordinates corresponding to at least one latitude and one longitude point and using at least six decimal digits; for plots of land of more than four hectares used for the production of the relevant commodities other than cattle, this shall be provided using polygons with sufficient latitude and longitude points to describe the perimeter of each plot of land;
(29) 'establishment' means any premises, structure, or, in the case of open-air farming, any environment or place, where livestock are kept, on a temporary or permanent basis;
(30) 'micro, small and medium-sized enterprises' or 'SMEs' means micro, small and medium-sized undertakings as defined in Article 3 of Directive 2013/34/EU of the European Parliament and of the Council;
(31) 'substantiated concern' means a duly reasoned claim based on objective and verifiable information regarding non-compliance with this Regulation and which could require the intervention of competent authorities;
(32) 'competent authorities' means the authorities designated under Article 14(1);
(33) 'customs authorities' means customs authorities as defined in Article 5, point (1), of Regulation (EU) No 952/2013;
(34) 'customs territory' means territory as defined in Article 4 of Regulation (EU) No 952/2013;
(35) 'third country' means a country or territory outside the customs territory of the Union;
(36) 'release for free circulation' means the procedure laid down in Article 201 of Regulation (EU) No 952/2013;
(37) 'export' means the procedure laid down in Article 269 of Regulation (EU) No 952/2013;
(38) 'relevant products entering the market' means relevant products from third countries placed under the customs procedure 'release for free circulation' that are intended to be placed on the Union market and are not intended for private use or consumption within the customs territory of the Union;
(39) 'relevant products leaving the market' means relevant products placed under the customs procedure 'export';
(40) 'relevant legislation of the country of production' means the laws applicable in the country of production concerning the legal status of the area of production in terms of:
(a) land use rights;
(b) environmental protection;
(c) forest-related rules, including forest management and biodiversity conservation, where directly related to wood harvesting;
(d) third parties' rights;
(e) labour rights;
(f) human rights protected under international law;
(g) the principle of free, prior and informed consent (FPIC), including as set out in the UN Declaration on the Rights of Indigenous Peoples;
(h) tax, anti-corruption, trade and customs regulations.`
    },
    'information-requirements': {
      title: "ARTICLE 9: Information requirements",
      content: `1. Operators shall collect information, documents and data which demonstrate that the relevant products comply with Article 3. For this purpose, the operator shall collect, organise and keep for five years from the date of the placing on the market or of the export of the relevant products the following information, accompanied by evidence, relating to each relevant product:
(a) a description, including the trade name and type of the relevant products as well as, in the case of relevant products that contain or have been made using wood, the common name of the species and their full scientific name; the product description shall include the list of relevant commodities or relevant products contained therein or used to make those products;
(b) the quantity of the relevant products; for relevant products entering or leaving the market, the quantity is to be expressed in kilograms of net mass and, where applicable, in the supplementary unit set out in Annex I to Council Regulation (EEC) No 2658/87 against the indicated Harmonised System code, or, in all other cases, the quantity is to be expressed in net mass or, where applicable, volume or number of items; a supplementary unit is applicable where it is defined consistently for all possible subheadings under the Harmonised System code referred to in the due diligence statement;
(c) the country of production and, where relevant, parts thereof;
(d) the geolocation of all plots of land where the relevant commodities that the relevant product contains, or has been made using, were produced, as well as the date or time range of production; where a relevant product contains or has been made with relevant commodities produced on different plots of land, the geolocation of all different plots of land shall be included; any deforestation or forest degradation on the given plots of land shall automatically disqualify all relevant commodities and relevant products from those plots of land from being placed or made available on the market or exported; for relevant products that contain or have been made using cattle, and for such relevant products that have been fed with relevant products, the geolocation shall refer to all the establishments where the cattle were kept; for all other relevant products of Annex I, the geolocation shall refer to the plots of land;
(e) the name, postal address and email address of any business or person from whom they have been supplied with the relevant products;
(f) the name, postal address and email address of any business, operator or trader to whom the relevant products have been supplied;
(g) adequately conclusive and verifiable information that the relevant products are deforestation-free;
(h) adequately conclusive and verifiable information that the relevant commodities have been produced in accordance with the relevant legislation of the country of production, including any arrangement conferring the right to use the respective area for the purposes of the production of the relevant commodity.
2. The operator shall make available to the competent authorities upon request the information, documents and data collected under this Article.`
    },
    'new-shipment': {
      title: "ARTICLE 2: EUDR Definitions (Relevant for Shipments)",
      content: `For shipment origin verification, the following definitions are particularly relevant:

(1) 'relevant commodities' means cattle, cocoa, coffee, oil palm, rubber, soya and wood;

(23) 'country of origin' means a country or territory as referred to in Article 60 of Regulation (EU) No 952/2013;

(24) 'country of production' means the country or territory where the relevant commodity or the relevant commodity used in the production of, or contained in, a relevant product was produced;

(27) 'plot of land' means land within a single real-estate property, as recognised by the law of the country of production, which enjoys sufficiently homogeneous conditions to allow an evaluation of the aggregate level of risk of deforestation and forest degradation associated with relevant commodities produced on that land;

(28) 'geolocation' means the geographical location of a plot of land described by means of latitude and longitude coordinates corresponding to at least one latitude and one longitude point and using at least six decimal digits; for plots of land of more than four hectares used for the production of the relevant commodities other than cattle, this shall be provided using polygons with sufficient latitude and longitude points to describe the perimeter of each plot of land;

Key Requirements for New Shipments:
- Must provide accurate geolocation data for all production plots
- Must verify country of production compliance
- Must ensure all commodities are deforestation-free
- Must have proper due diligence documentation before shipment`
    },
    'due-diligence': {
      title: "ARTICLES 8, 10 & 11: Due Diligence, Risk Assessment & Risk Mitigation",
      content: `ARTICLE 8: Due diligence
1. Prior to placing relevant products on the market or exporting them, operators shall exercise due diligence with regard to all relevant products supplied by each particular supplier.
2. The due diligence shall include:
(a) the collection of information, data and documents needed to fulfil the requirements set out in Article 9;
(b) risk assessment measures as referred to in Article 10;
(c) risk mitigation measures as referred to in Article 11.

ARTICLE 10: Risk assessment
1. Operators shall verify and analyse the information collected in accordance with Article 9 and any other relevant documentation. On the basis of that information and documentation, the operators shall carry out a risk assessment to establish whether there is a risk that the relevant products intended to be placed on the market or exported are non-compliant. Operators shall not place the relevant products on the market or export them, except where the risk assessment reveals no or only a negligible risk that the relevant products are non-compliant.
2. The risk assessment shall take into account, in particular, the following criteria:
(a) the assignment of risk to the relevant country of production or parts thereof in accordance with Article 29;
(b) the presence of forests in the country of production or parts thereof;
(c) the presence of indigenous peoples in the country of production or parts thereof;
(d) the consultation and cooperation in good faith with indigenous peoples in the country of production or parts thereof;
(e) the existence of duly reasoned claims by indigenous peoples based on objective and verifiable information regarding the use or ownership of the area used for the purpose of producing the relevant commodity;
(f) prevalence of deforestation or forest degradation in the country of production or parts thereof;
(g) the source, reliability, validity, and links to other available documentation of the information referred to in Article 9(1);
(h) concerns in relation to the country of production and origin or parts thereof, such as level of corruption, prevalence of document and data falsification, lack of law enforcement, violations of international human rights, armed conflict or presence of sanctions imposed by the UN Security Council or the Council of the European Union;
(i) the complexity of the relevant supply chain and the stage of processing of the relevant products, in particular difficulties in connecting relevant products to the plot of land where the relevant commodities were produced;
(j) the risk of circumvention of this Regulation or of mixing with relevant products of unknown origin or produced in areas where deforestation or forest degradation has occurred or is occurring;
(k) conclusions of the meetings of the Commission expert groups supporting the implementation of this Regulation, as published in the Commission's expert group register;
(l) substantiated concerns submitted under Article 31, and information on the history of non-compliance of operators or traders along the relevant supply chain with this Regulation;
(m) any information that would point to a risk that the relevant products are non-compliant;
(n) complementary information on compliance with this Regulation, which may include information supplied by certification or other third-party verified schemes, including voluntary schemes recognised by the Commission under Article 30(5) of Directive (EU) 2018/2001 of the European Parliament and of the Council, provided that the information meets the requirements set out in Article 9 of this Regulation.
3. Wood products which fall within the scope of Regulation (EC) No 2173/2005 that are covered by a valid FLEGT license from an operational licensing scheme shall be deemed to comply with Article 3, point (b), of this Regulation.
4. The operators shall document and review the risk assessments at least on an annual basis and make them available to the competent authorities upon request. Operators shall be able to demonstrate how the information gathered was checked against the risk assessment criteria set out in paragraph 2 and how they determined the degree of risk.

ARTICLE 11: Risk mitigation
1. Except where a risk assessment carried out in accordance with Article 10 reveals that there is no or only a negligible risk that the relevant products are non-compliant, the operator shall, prior to placing the relevant products on the market or exporting them, adopt risk mitigation procedures and measures that are adequate to achieve no or only a negligible risk. Such procedures and measures may include any of the following:
(a) requiring additional information, data or documents;
(b) carrying out independent surveys or audits;
(c) taking other measures pertaining to information requirements set out in Article 9.
Such procedures and measures may also include supporting compliance with this Regulation by that operator's suppliers, in particular smallholders, through capacity building and investments.
2. Operators shall have in place adequate and proportionate policies, controls and procedures to mitigate and manage effectively the risks of non-compliance of relevant products identified. Those policies, controls and procedures shall include:
(a) model risk management practices, reporting, record-keeping, internal control and compliance management, including the appointment of a compliance officer at management level for non-SME operators;
(b) an independent audit function to check the internal policies, controls and procedures referred to in point (a) for all non-SME operators.
3. The decisions on risk mitigation procedures and measures shall be documented, reviewed at least on an annual basis and made available by the operators to the competent authorities upon request. Operators shall be able to demonstrate how decisions on risk mitigation procedures and measures were taken.`
    }
  };

  // Get the article content based on articleType
  const articleData = articlesContent[articleType] || null;

  // If no article data for this type, don't render
  if (!articleData) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with faster animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              // Prevent closing when clicking backdrop - users must click the button
              e.stopPropagation();
            }}
            className="fixed inset-0 bg-black bg-opacity-60 z-[10000]"
          />

          {/* Targeted Regulations Modal - Centered in viewport */}
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[85vh] flex flex-col border-2 border-green-300"
            >
              {/* Header - Removed X button */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl z-10">
                <div className="flex items-center gap-3">
                  <BookOpen size={28} />
                  <div>
                    <h2 className="text-2xl font-bold">Required Reading</h2>
                    <p className="text-green-100 text-sm mt-1">
                      You must review this regulation before proceeding
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V7z" clipRule="evenodd" />
                    </svg>
                    Relevant to: {getTabName(articleType)}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-green-800 mb-3">
                    {articleData.title}
                  </h3>
                  
                  <div className="text-sm text-gray-600 mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="font-medium text-yellow-800 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Important Notice
                    </p>
                    <p className="mt-1 text-yellow-700">
                      You <span className="font-semibold">must read and understand</span> this regulation before working in the "{getTabName(articleType)}" section. This is a compliance requirement.
                    </p>
                  </div>
                </div>

                {/* Article Content */}
                <div className="bg-white p-5 rounded-lg border border-green-200 shadow-sm mb-6">
                  <div className="overflow-y-auto max-h-[300px]">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                      {articleData.content}
                    </pre>
                  </div>
                </div>

                {/* Scroll indicator for long content */}
                <div className="text-center text-gray-500 text-xs mb-4">
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Scroll to read the full regulation
                </div>
              </div>

              {/* Close Button - Only way to close */}
              <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white p-6 border-t border-gray-200 rounded-b-xl">
                <div className="mb-3 text-center">
                  <p className="text-sm text-gray-600">
                    By clicking below, you confirm that you have read and understood this regulation
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  ✓ I Have Read & Understand, Proceed to Section
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper function to get tab name
const getTabName = (tabId) => {
  const tabNames = {
    'subject-matter': 'Subject matter & scope',
    'eudr-definitions': 'EUDR Definition of terms',
    'information-requirements': 'Information requirements',
    'new-shipment': 'New Shipment Origin',
    'due-diligence': 'Due Diligence (Articles 8, 10 & 11)'
  };
  return tabNames[tabId] || tabId;
};

export default TargetedRegulations;