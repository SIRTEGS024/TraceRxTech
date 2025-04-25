import { FiCheck } from "react-icons/fi";

const ProcessItem = ({ title, subtext, listItems, img, reverse = false }) => {
  return (
    <div
      className={`flex flex-col lg:flex-row ${
        reverse ? "lg:flex-row-reverse" : ""
      } items-center gap-10 px-6 lg:px-12`}
    >
      {/* Textual Info */}
      <div className="w-full lg:w-1/2 space-y-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        {subtext && <p className="text-gray-600">{subtext}</p>}

        {listItems.map((list, index) => (
          <div key={index}>
            <h4 className="font-semibold text-gray-700 mb-2">
              {list.listTitle}
            </h4>
            <ul className="list-none space-y-2">
              {list.listItems.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <span className="min-w-[22px] min-h-[22px] flex items-center justify-center rounded-full bg-black">
                    <FiCheck className="text-white text-[10px]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Image */}
      {img && (
        <div className="w-full lg:w-1/2">
          <img
            src={img}
            alt={title}
            className="w-full h-auto rounded-md object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default ProcessItem;
