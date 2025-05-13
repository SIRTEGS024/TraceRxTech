import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // or "next/link" if using Next.js
import backg from "../assets/blog-backg.jpg";
import { FaSearch } from "react-icons/fa";
import BlogCard from "../components/BlogCard";
import ReusableInput from "../components/ReusableInput";
import { BLOG_DATA } from "../constants";

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src={backg}
            alt="Gardening background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            TraceRxTech Blog
          </motion.h1>
          <div className="max-w-2xl mx-auto">
            <ReusableInput
              placeholder="Search articles..."
              variant="white"
              icon={FaSearch}
            />
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_DATA.map((post) => (
              <motion.a
                key={post.id}
                href={post.link}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="block rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <BlogCard
                  image={post.image}
                  title={post.title}
                  excerpt={post.excerpt}
                  date={post.date}
                />
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
