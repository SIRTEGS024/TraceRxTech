// Regulations.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const Regulations = ({ isOpen, onClose }) => {
  const [openArticles, setOpenArticles] = useState({});

  const toggleArticle = (articleNumber) => {
    setOpenArticles(prev => ({
      ...prev,
      [articleNumber]: !prev[articleNumber]
    }));
  };

  const regulationsData = {
    article1: {
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
    article2: {
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
    article7: {
      title: "ARTICLE 7: Placing on the market by operators established in third countries",
      content: `Where a natural or legal person established outside the Union places relevant products on the market, the first natural or legal person established in the Union who makes such relevant products available on the market shall be deemed to be an operator within the meaning of this Regulation.`
    },
    article8: {
      title: "ARTICLE 8: Due diligence",
      content: `1. Prior to placing relevant products on the market or exporting them, operators shall exercise due diligence with regard to all relevant products supplied by each particular supplier.
2. The due diligence shall include:
(a) the collection of information, data and documents needed to fulfil the requirements set out in Article 9;
(b) risk assessment measures as referred to in Article 10;
(c) risk mitigation measures as referred to in Article 11.`
    },
    article9: {
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
    article10: {
      title: "ARTICLE 10: Risk assessment",
      content: `1. Operators shall verify and analyse the information collected in accordance with Article 9 and any other relevant documentation. On the basis of that information and documentation, the operators shall carry out a risk assessment to establish whether there is a risk that the relevant products intended to be placed on the market or exported are non-compliant. Operators shall not place the relevant products on the market or export them, except where the risk assessment reveals no or only a negligible risk that the relevant products are non-compliant.
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
4. The operators shall document and review the risk assessments at least on an annual basis and make them available to the competent authorities upon request. Operators shall be able to demonstrate how the information gathered was checked against the risk assessment criteria set out in paragraph 2 and how they determined the degree of risk.`
    },
    article11: {
      title: "ARTICLE 11: Risk mitigation",
      content: `1. Except where a risk assessment carried out in accordance with Article 10 reveals that there is no or only a negligible risk that the relevant products are non-compliant, the operator shall, prior to placing the relevant products on the market or exporting them, adopt risk mitigation procedures and measures that are adequate to achieve no or only a negligible risk. Such procedures and measures may include any of the following:
(a) requiring additional information, data or documents;
(b) carrying out independent surveys or audits;
(c) taking other measures pertaining to information requirements set out in Article 9.
Such procedures and measures may also include supporting compliance with this Regulation by that operator's suppliers, in particular smallholders, through capacity building and investments.
2. Operators shall have in place adequate and proportionate policies, controls and procedures to mitigate and manage effectively the risks of non-compliance of relevant products identified. Those policies, controls and procedures shall include:
(a) model risk management practices, reporting, record-keeping, internal control and compliance management, including the appointment of a compliance officer at management level for non-SME operators;
(b) an independent audit function to check the internal policies, controls and procedures referred to in point (a) for all non-SME operators.
3. The decisions on risk mitigation procedures and measures shall be documented, reviewed at least on an annual basis and made available by the operators to the competent authorities upon request. Operators shall be able to demonstrate how decisions on risk mitigation procedures and measures were taken.`
    },
    documentUpload: {
      title: "DOCUMENT UPLOAD: for High-Risk mitigation",
      content: `(a) requiring additional information, data or documents;
(b) carrying out independent surveys or audits;
(c) taking other measures pertaining to information requirements set out in Article 9.
E.g. capacity building and investments.
(d) operators shall have in place adequate and proportionate policies, controls and procedures to mitigate and manage effectively the risks of non-compliance of relevant products identified. Those policies, controls and procedures shall include:
(a) model risk management practices, reporting, record-keeping, internal control and compliance management, including the appointment of a compliance officer at management level for non-SME operators;
(b) an independent audit function to check the internal policies, controls and procedures referred to in point (a) for all non-SME operators.
3. The decisions on risk mitigation procedures and measures shall be documented, reviewed at least on an annual basis and made available by the operators to the competent authorities upon request. Operators shall be able to demonstrate how decisions on risk mitigation procedures and measures were taken.`
    },
    dueDiligenceStatement: {
      title: "DUE DILIGENCE STATEMENT",
      content: `Information to be contained in the due diligence statement in accordance with Article 4(2):
1. ……….. (EU IMPORTER), of ……………(EU ADDRESS)………… and, in the event of our relevant commodities and relevant products our product namely (cattle, cocoa, coffee, oil palm, rubber, soya and wood) entering or leaving the EU market, the Economic Operators Registration and Identification (EORI) number of………(Importer) in accordance with Article 9 of Regulation (EU) No 952/2013.

2. Harmonised System code, free-text description, including the trade name as well as, where applicable, the full scientific name, and quantity of the relevant product that the operator intends to place on the market or export.
For relevant products entering or leaving the market, the quantity is to be expressed in kilograms of net mass and, where applicable, in the supplementary unit set out in Annex I to Regulation (EEC) No 2658/87 against the indicated Harmonised System code or, in all other cases, expressed in net mass specifying a percentage estimate or deviation or, where applicable, volume or number of items. A supplementary unit is applicable where it is defined consistently for all possible subheadings under the Harmonised System code referred to in the due diligence statement.

3. Country of production and the geolocation of all plots of land where the relevant commodities were produced. For relevant products that contain or have been made using cattle, and for such relevant products that have been fed with relevant products, the geolocation shall refer to all the establishments where the cattle were kept. Where the relevant product contains or has been made using commodities produced in different plots of land, the geolocation of all plots of land shall be included in accordance with Article 9(1), point (d).
4. For operators referring to an existing due diligence statement pursuant to Article 4(8) and (9), the reference number of such due diligence statement.

5. The text: 'By submitting this due diligence statement the operator confirms that due diligence in accordance with Regulation (EU) 2023/1115 was carried out and that no or only a negligible risk was found that the relevant products do not comply with Article 3, point (a) or (b), of that Regulation.'.
6. Signature in the following format:

Signed for and on behalf of: ABD LTD
Date:
Name and function:
Signature:`
    }
  };

  const renderArticle = (key, data) => {
    const isOpen = openArticles[key];

    return (
      <div key={key} className="mb-4">
        <button
          onClick={() => toggleArticle(key)}
          className="flex items-center justify-between w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
        >
          <span className="font-semibold text-green-800 flex items-center gap-2">
            <BookOpen size={16} />
            {data.title}
          </span>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-white border border-green-200 rounded-b-lg mt-[-1px]">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                  {data.content}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          />

          {/* Regulations Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 right-0 h-full w-full md:w-3/4 lg:w-1/2 xl:w-2/5 bg-white shadow-2xl z-[9999] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen size={28} />
                  <div>
                    <h2 className="text-2xl font-bold">EUDR Regulations</h2>
                    <p className="text-green-100 text-sm mt-1">
                      European Union Deforestation-Free Regulation (EUDR) 2023/1115
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-green-700 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mt-4 p-3 bg-green-700 bg-opacity-30 rounded-lg">
                <p className="text-sm">
                  These regulations must be followed when importing/exporting relevant commodities
                  and products as per EUDR requirements.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Essential Articles & Requirements
                </h3>
                <p className="text-gray-600 mb-4">
                  Expand each section to view detailed regulatory requirements. All uploads and
                  documentation must comply with these regulations.
                </p>
              </div>

              {/* Articles List */}
              <div className="space-y-2">
                {Object.entries(regulationsData).map(([key, data]) =>
                  renderArticle(key, data)
                )}
              </div>

              {/* Footer Note */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Important Notice
                </h4>
                <p className="text-sm text-blue-700">
                  All documents uploaded to TraceRX must comply with the above EUDR regulations.
                  Non-compliance may result in legal penalties and rejection of shipments.
                  Ensure all documentation is complete, accurate, and verifiable before submission.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Regulations;