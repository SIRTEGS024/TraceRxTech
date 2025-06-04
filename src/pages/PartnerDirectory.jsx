import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CONTAINERS } from "../constants";
import TitleSubtext from "../components/TitleSubtext";
import { FaSearch, FaTimes } from "react-icons/fa";

const PartnerDirectory = () => {
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [activeType, setActiveType] = useState("Container/Bill of Lading Number");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const param = searchParams.get("search");
    if (param) {
      setSearch(param);
      setInputValue(param);
    }
  }, [searchParams]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    setSearch(trimmed);
    setSearchParams({ search: trimmed });
  };

  const handleClear = () => {
    setInputValue("");
    setSearch("");
    setSearchParams({});
  };

  const filteredContainers = CONTAINERS.filter(container =>
    container.containerNo === search
  );

  const showResults = search.trim().length > 0;

  return (
    <main className="bg-green-50 pt-20 pb-16 px-4">
      <TitleSubtext title="Tracking" size="large" />

      {/* Radio Buttons */}
      <div className="flex justify-center gap-6 my-6">
        {["Container/Bill of Lading Number", "Booking Number"].map((type) => (
          <label key={type} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="searchType"
              value={type}
              checked={activeType === type}
              onChange={() => setActiveType(type)}
              className="accent-green-600"
            />
            <span className="text-gray-700">{type}</span>
          </label>
        ))}
      </div>

      {/* Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative max-w-xl mx-auto mb-8"
      >
        {/* Left search icon (only when input is empty) */}
        {inputValue === "" && (
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        )}
        <input
          type="text"
          placeholder={`Search by ${activeType}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`w-full pl-10 pr-24 py-2 rounded border ${
            inputValue ? "border-green-600 ring-1 ring-green-300" : "border-gray-300"
          } focus:outline-none`}
        />
        {inputValue && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 border-l border-green-500 pl-2">
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <FaTimes className="text-green-600 hover:text-green-800" />
            </button>
            <button
              type="submit"
              aria-label="Submit search"
            >
              <FaSearch className="text-green-600 hover:text-green-800" />
            </button>
          </div>
        )}
      </form>

      {/* Results */}
      <div className="text-center">
        {showResults && (
          filteredContainers.length === 0 ? (
            <p className="text-gray-600">No results found for this Container number</p>
          ) : (
            <p className="text-2xl font-semibold text-green-700">{filteredContainers[0].containerNo}</p>
          )
        )}
      </div>
    </main>
  );
};

export default PartnerDirectory;
