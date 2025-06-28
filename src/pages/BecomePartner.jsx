// import { useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import PartnerTypeCard from "../components/PartnerTypeCard";
// import StepCard from "../components/StepCard";
// import { PARTNER_TYPES, PARTNER_STEPS } from "../constants";

// // Animation variants
// const fadeUp = {
//   initial: { opacity: 0, y: 20 },
//   animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
//   exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
// };

// const BecomePartner = () => {
//   const [selected, setSelected] = useState("technology");
//   const currentPartner = PARTNER_TYPES.find((type) => type.id === selected);

//   return (
//     <main className="bg-green-50 pt-20 pb-16 px-4">
//       {/* Hero */}
//       <motion.section
//         {...fadeUp}
//         className="text-center mb-16"
//       >
//         <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
//           Partner with TraceRxTech
//         </h1>
//         <p className="text-lg text-gray-700 max-w-2xl mx-auto">
//           Join hands with us to drive agricultural transformation across Africa.
//         </p>
//       </motion.section>

//       {/* Why Partner */}
//       <motion.section
//         {...fadeUp}
//         className="mb-20 max-w-6xl mx-auto text-center"
//       >
//         <h2 className="text-3xl font-bold text-green-800 mb-6">
//           Why Become a Partner?
//         </h2>
//         <p className="text-gray-700 mb-4">
//           TraceRxTech is committed to building sustainable solutions for the agricultural ecosystem.
//           By partnering with us, you join a mission-led network of innovators creating real impact in
//           food security and digital transformation.
//         </p>
//         <p className="text-gray-700">
//           Whether you're a tech innovator, market reseller, or agri-business consultant, there's a space
//           for you in our ecosystem.
//         </p>
//       </motion.section>

//       {/* Partner Types */}
//       <section className="mb-20 max-w-7xl mx-auto">
//         <div className="flex flex-wrap justify-center gap-4 mb-8">
//           {PARTNER_TYPES.map(({ id, title }) => (
//             <button
//               key={id}
//               onClick={() => setSelected(id)}
//               className={`px-6 py-2 rounded-full border transition-all ${
//                 selected === id
//                   ? "bg-green-700 text-white"
//                   : "bg-white text-green-700 border-green-300 hover:bg-green-100"
//               }`}
//             >
//               {title}
//             </button>
//           ))}
//         </div>

//         <AnimatePresence mode="wait" initial={false}>
//           <motion.div
//             key={selected}
//             {...fadeUp}
//           >
//             {currentPartner && (
//               <PartnerTypeCard
//                 title={currentPartner.title}
//                 description={currentPartner.description}
//                 benefits={currentPartner.benefits}
//               />
//             )}
//           </motion.div>
//         </AnimatePresence>
//       </section>

//       {/* Steps */}
//       <motion.section
//         {...fadeUp}
//         className="mb-20 max-w-6xl mx-auto text-center"
//       >
//         <h2 className="text-3xl font-bold text-green-800 mb-8">
//           How to Become a Partner
//         </h2>
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//           {PARTNER_STEPS.map((step) => (
//             <StepCard
//               key={step.id}
//               step={step.id}
//               title={step.title}
//               description={step.description}
//             />
//           ))}
//         </div>
//       </motion.section>

//       {/* CTA */}
//       <motion.section
//         {...fadeUp}
//         className="text-center"
//       >
//         <h3 className="text-2xl font-bold text-green-800 mb-4">
//           Ready to Make an Impact?
//         </h3>
//         <p className="text-gray-600 mb-6">
//           Start your partnership journey today and help transform agriculture.
//         </p>
//         <button className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full transition">
//           Begin Partnership Process
//         </button>
//       </motion.section>
//     </main>
//   );
// };

// export default BecomePartner;
