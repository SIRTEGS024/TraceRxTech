// components/BlogCard.jsx
const BlogCard = ({ image, title, excerpt, date }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="h-48 bg-gray-100 relative">
        <img 
          src={image?.src || image} 
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <span className="text-sm text-gray-500 mb-2">{date}</span>
        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4 flex-1">{excerpt}</p>
        <div className="mt-auto">
          <button className="text-green-600 font-semibold hover:text-green-700 transition-colors">
            Read Article →
          </button>
        </div>
      </div>
    </div>
  )
}

export default BlogCard