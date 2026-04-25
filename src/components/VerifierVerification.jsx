// components/VerifierVerification.js (updated)
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import SubjectMatterScope from "./SubjectMatterScope";
import EUDRDefinitions from "./EudrDefinitions";
import InformationRequirements from "./InformationRequirements";
import PastDueDiligence from "./PastDueDiligence";
import CurrentDueDiligence from "./CurrentDueDiligence";
import TargetedRegulations from "./TargetedRegulations";

const subTabToArticleMap = {
  "subject-matter": "subject-matter",
  "eudr-definitions": "eudr-definitions",
  "information-requirements": "information-requirements",
  "past-due-diligence": "due-diligence",
  "current-due-diligence": "due-diligence",
};

const subTabsWithRegulations = [
  "subject-matter",
  "eudr-definitions",
  "information-requirements",
  "past-due-diligence",
  "current-due-diligence",
];

const VerifierVerification = () => {
  const { user, demoData } = useUserStore();
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [showTargetedRegulations, setShowTargetedRegulations] = useState(false);
  const [visitedSubTabs, setVisitedSubTabs] = useState({});

  const targetCompany = user?.loggedInAs?.companyId
    ? demoData.users[user.loggedInAs.companyId]
    : null;

  const accessTabs = user?.loggedInAs?.accessTabs || {};

  const getAvailableSubTabs = () => {
    if (!targetCompany) return [];

    const isExporter = targetCompany.role === "exporter";
    const isImporter = targetCompany.role === "importer";
    const subTabs = [];

    if (accessTabs.subjectMatterScope !== false) {
      subTabs.push({
        id: "subject-matter",
        name: "Subject Matter & Scope",
        component: SubjectMatterScope,
        articleKey: "subject-matter",
      });
    }

    if (isExporter) {
      if (accessTabs.eudrDefinitions !== false) {
        subTabs.push({
          id: "eudr-definitions",
          name: "EUDR Definition of terms",
          component: EUDRDefinitions,
          articleKey: "eudr-definitions",
        });
      }
      if (accessTabs.informationRequirements !== false) {
        subTabs.push({
          id: "information-requirements",
          name: "Information requirements",
          component: InformationRequirements,
          articleKey: "information-requirements",
        });
      }
    }

    if (isImporter) {
      if (accessTabs.pastDueDiligence !== false) {
        subTabs.push({
          id: "past-due-diligence",
          name: "Past Due Diligence",
          component: PastDueDiligence,
          articleKey: "past-due-diligence",
        });
      }
      if (accessTabs.currentDueDiligence !== false) {
        subTabs.push({
          id: "current-due-diligence",
          name: "Current Due Diligence",
          component: CurrentDueDiligence,
          articleKey: "current-due-diligence",
        });
      }
    }

    return subTabs;
  };

  const availableSubTabs = getAvailableSubTabs();

  useEffect(() => {
    if (availableSubTabs.length > 0 && !activeSubTab) {
      setActiveSubTab(availableSubTabs[0].id);
    }
  }, [availableSubTabs, activeSubTab]);

  const handleSubTabChange = (subTabId) => {
    setActiveSubTab(subTabId);
    if (subTabsWithRegulations.includes(subTabId) && !visitedSubTabs[subTabId]) {
      setTimeout(() => {
        setVisitedSubTabs((prev) => ({ ...prev, [subTabId]: true }));
      }, 100);
      setShowTargetedRegulations(true);
    }
  };

  const renderActiveComponent = () => {
    const active = availableSubTabs.find((tab) => tab.id === activeSubTab);
    if (!active) return null;
    const Component = active.component;
    return <Component />;
  };

  if (!targetCompany) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">
          No company selected. Please select a company from the Company Access tab.
        </p>
      </div>
    );
  }

  if (availableSubTabs.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">
          You don't have access to any verification sections for this company.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6">
        Verification
      </h1>

      {/* Sub-tab navigation - responsive */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <div className="flex space-x-4 min-w-max">
          {availableSubTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id)}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeSubTab === tab.id
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {renderActiveComponent()}
      </div>

      <TargetedRegulations
        isOpen={showTargetedRegulations}
        onClose={() => setShowTargetedRegulations(false)}
        articleType={subTabToArticleMap[activeSubTab]}
      />
    </div>
  );
};

export default VerifierVerification;