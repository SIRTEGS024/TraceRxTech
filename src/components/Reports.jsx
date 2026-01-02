import { motion} from 'framer-motion';
const Reports = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6"
  >
    <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0">Compliance Reports</h1>
    <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
      <p className="text-gray-700">
        Generate comprehensive compliance reports, analytics, and regulatory documentation.
      </p>
    </div>
  </motion.div>
);
export default Reports;