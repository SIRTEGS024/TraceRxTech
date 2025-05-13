import { useState } from "react";
import { PARTNER_COMPANIES } from "../constants";
import PartnerCompanyCard from "../components/PartnerCompanyCard";

const ROLES = ["Technology Partner", "Reseller Partner", "Consultation Partner"];

const PartnerDirectory = () => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const filteredCompanies = PARTNER_COMPANIES.filter((company) => {
    const matchName = company.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || company.role === filterRole;
    return matchName && matchRole;
  });

  return (
    <main className="bg-green-50 pt-20 pb-16 px-4">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Our Partners</h1>
        <p className="text-gray-700 max-w-xl mx-auto">
          Explore the amazing companies collaborating with us to transform agriculture.
        </p>
      </section>

      {/* Search and Filter */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          aria-label="Search by company name"
          placeholder="Search by company name/RC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded border border-gray-300 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <select
          aria-label="Filter by partner role"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 rounded border border-gray-300 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          <option value="all">All Roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Partner Cards or No Results */}
      {filteredCompanies.length === 0 ? (
        <p className="text-center text-gray-600">No companies match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredCompanies.map((company) => (
            <PartnerCompanyCard key={company.id} {...company} />
          ))}
        </div>
      )}
    </main>
  );
};

export default PartnerDirectory;
