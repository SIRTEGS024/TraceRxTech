import { motion } from "framer-motion";
import MediaCard from "../components/MediaCard";
import { MEDIA_DATA } from "../constants";

const MediaPage = () => {
  return (
    <main className="flex-grow pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Title & Intro */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-green-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            TraceRxTech In the Media
          </motion.h1>
          <motion.p
            className="text-gray-600 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Stay updated with the latest news, features, and press releases
            about TraceRxTech’s impact in the agri-tech and sustainability space.
          </motion.p>
        </motion.div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MEDIA_DATA.map((item) => (
            <MediaCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default MediaPage;
