
import React from 'react';

export type NavItemId = "home" | "discover" | "spaces" | "finance" | "account";

export type SlideId =
  | "innovationBelowGround"
  | "stewardsOfSewers"
  | "throughTheTunnels"
  | "eyeOnUnderground"
  | "savingCities"
  | "mastersOfMain"
  | "wiredForFuture"
  | "engineeringTomorrow"
  | "visionariesBelow"
  | "cleanStarts"
  | "evolutionVelocity"
  | "evidenceLocker"
  | "appendixCharts1"
  | "closingChapter";

export interface NarrationBlock {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  bullets: string[];
}

export type ChartKind =
  | "None"
  | "CCTV"
  | "BidAmounts"
  | "ProjectCosts"
  | "ContractorSchedule"
  | "GrowthBridge"
  | "AcquisitionMap"
  | "Covenant"
  | "Timeline"
  | "TechStack"
  | "Ecosystem"
  | "Evolution"
  | "Evidence"
  | "Dossier"
  | "Closing"
  | "AISewersViz";

export interface SlideDefinition {
  id: SlideId;
  navItem: NavItemId;
  title: string;
  subtitle?: string;
  narration: NarrationBlock;
  chartKind?: ChartKind;
  dataKey?: string;
  agentLeePromptHint?: string;
  visualNotes?: string[];
}

export interface NavItem {
  id: NavItemId;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StoryConfig {
  appTitle: string;
  tagline?: string;
  navItems: NavItem[];
  slides: SlideDefinition[];
}

// --- Data Schemas ---

export interface EvidenceRecord {
  id: string;
  title: string;
  type: "PDF" | "Link" | "Data";
  url?: string;
  date: string;
  tag: "Verified" | "Projected";
  source?: string;
}

export interface CctvInspectionRecord {
  segmentId: string;
  location: string;
  installationYear?: number;
  damageScore: number;
  riskCategory: "Low" | "Medium" | "High" | "Critical";
  method: "Manual" | "AI-Assisted";
  reviewTimeMinutes: number;
  evidenceRef?: string; // Link to evidence ID
}

export interface ProjectCostRecord {
  projectId: string;
  year: number;
  municipality: string;
  method: "trenchless" | "traditional";
  budgetAmount: number;
  actualAmount: number;
  disruptionDays: number;
  evidenceRef?: string;
}

export interface OperationalVelocityRecord {
  year: string; // 2020-2050
  region: string;
  crewCount: number;
  projectsCompleted: number;
  evidenceRef?: string;
}

export interface FinancialRecord {
  category: string;
  value: number;
  type: "Base" | "Growth" | "Total";
  evidenceRef?: string;
}

export interface HistoricalDataPoint {
  year: string;
  value: number;
  milestone?: string;
  evidenceRef?: string;
}

export interface AcquisitionRecord {
  id: string;
  name: string;
  region: string;
  description: string;
  year: string;
  coordinates: { x: number; y: number };
  evidenceRef?: string;
}

export interface TechMetricRecord {
  phase: string;
  metric: string;
  value: number; // Normalized 0-100 or actual
  label: string;
  evidenceRef?: string;
}

export interface EcosystemRecord {
  category: "Safety" | "Robotics" | "AI" | "Future";
  partners: string[];
  impactScore: number;
  evidenceRef?: string;
}

export interface CaseStudyRecord {
  study: string;
  costPerFootBefore: number;
  costPerFootAfter: number;
  savingsPercent: number;
  evidenceRef?: string;
}

export interface DataSources {
  cctvInspections: CctvInspectionRecord[];
  projectCosts: ProjectCostRecord[];
  operationalVelocity: OperationalVelocityRecord[];
  financials: FinancialRecord[];
  acquisitions: AcquisitionRecord[];
  historicalGrowth: HistoricalDataPoint[];
  evidenceItems: EvidenceRecord[];
  techMetrics: TechMetricRecord[];
  ecosystemMetrics: EcosystemRecord[];
  caseStudies: CaseStudyRecord[];
}

export type UserRole = "Executive" | "Investor" | "Municipality";

export type PresentationMode = "Auto" | "Manual";
