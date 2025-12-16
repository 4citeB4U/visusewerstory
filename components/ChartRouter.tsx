/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: UI.COMPONENT.CHART.ROUTER
REGION: 🔵 UI

STACK: LANG=tsx; FW=react; UI=tailwind; BUILD=node
RUNTIME: browser
TARGET: web-app

DISCOVERY_PIPELINE:
  MODEL=Voice>Intent>Location>Vertical>Ranking>Render;
  ROLE=support;
  INTENT_SCOPE=n/a;
  LOCATION_DEP=none;
  VERTICALS=n/a;
  RENDER_SURFACE=in-app;
  SPEC_REF=LEEWAY.v12.DiscoveryArchitecture

LEEWAY-LD:
{
  "@context": ["https://schema.org", {"leeway":"https://leeway.dev/ns#"}],
  "@type": "SoftwareSourceCode",
  "name": "Chart Router Component",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "UI", "Charts", "Router"],
  "identifier": "UI.COMPONENT.CHART.ROUTER",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Route slide chartKind to the appropriate visualization component; WHY=Dynamic chart component selection; WHO=Leeway Industries; WHERE=/components/ChartRouter.tsx; WHEN=2025-12-09; HOW=Switch statement + chart component mapping
SPDX-License-Identifier: MIT
============================================================================ */

import React from "react";
import { DataSources, SlideDefinition } from "../types";
import AISewersDataViz from "./AISewersDataViz";
import {
    AcquisitionsMap,
    CctvChart,
    ClosingVisual,
    CovenantVisual,
    DefaultVisual,
    DossierVisual,
    EcosystemVisual,
    EvidenceVisual,
    EvolutionVisual,
    GrowthBridgeChart,
    ProjectCostsChart,
    ScheduleChart,
    TechStackVisual,
    TimelineVisual
} from "./Charts";
import Page13Speech from "./Page13Speech";
import Page15AIQA from "./Page15AIQA";

interface ChartRouterProps {
  slide: SlideDefinition;
  dataSources: DataSources;
  isSpeaking: boolean;
  selectedTab?: string;
}

export const ChartRouter: React.FC<ChartRouterProps> = ({ slide, dataSources, isSpeaking, selectedTab }) => {
  // Cast to any to allow custom chart kinds added at runtime
  switch (slide.chartKind as any) {
    case "CCTV":
      return <CctvChart data={dataSources.cctvInspections} isSpeaking={isSpeaking} />;
    case "ProjectCosts":
      return <ProjectCostsChart data={dataSources.projectCosts} isSpeaking={isSpeaking} />;
    case "ContractorSchedule":
      return <ScheduleChart data={dataSources.operationalVelocity} isSpeaking={isSpeaking} />;
    case "GrowthBridge":
        return <GrowthBridgeChart data={dataSources.financials} isSpeaking={isSpeaking} />;
    case "AcquisitionMap":
        return <AcquisitionsMap data={dataSources.acquisitions} />;
    case "BidAmounts":
        return <ProjectCostsChart data={dataSources.projectCosts} isSpeaking={isSpeaking} />; 
    case "Covenant":
        return <CovenantVisual />;
    case "Timeline":
        return <TimelineVisual data={dataSources.historicalGrowth} isSpeaking={isSpeaking} />;
    case "TechStack":
        return <TechStackVisual data={dataSources.techMetrics} isSpeaking={isSpeaking} />;
    case "Ecosystem":
        return <EcosystemVisual data={dataSources.ecosystemMetrics} />;
    case "Evolution":
        return <EvolutionVisual />;
    case "Evidence":
        return <EvidenceVisual data={dataSources.evidenceItems} caseStudies={dataSources.caseStudies} />;
    case "AISewersViz":
      return <AISewersDataViz />;
    case "Page13Speech":
      return <Page13Speech />;
    case "AIQA":
      return <Page15AIQA />;
    case "Dossier":
        return <DossierVisual />;
    case "Closing":
        return <ClosingVisual />;
    case "None":
    default:
      return <DefaultVisual title={slide.visualNotes?.[0] || "Visual Content"} />;
  }
};
