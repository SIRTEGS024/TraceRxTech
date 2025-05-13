import { motion } from "framer-motion";

export default function TopNavbar() {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-14 bg-emerald-700 flex items-center text-white font-medium shadow-md"
    >
      <p className="text-center w-full px-4 text-sm md:text-base">
        Is Your Business EUDR-Ready? Don't Risk Shipment Rejections & Compliance
        Penalties | Assess Your Readiness Now!
      </p>
    </motion.div>
  );
}
