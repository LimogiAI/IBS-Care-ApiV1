// src/utils/defaultAssessments.ts
import { IBSAssessment } from "../types/ibs";

export function getDefaultAssessment(): IBSAssessment {
  return {
    overallNarrativeSummary: "Unable to complete IBS assessment at this time.",
    clinicalAssessment: {
      romeIVCriteriaMet: false,
      narrativeSummary: "Assessment incomplete due to system error.",
      ibsSSS: {
        narrativeSummary: "Assessment incomplete",
        abdominalPainSeverity: {
          value: 0,
          sourceData: null,
          clinicalGap: "Data collection failed",
        },
        abdominalPainFrequency: {
          value: 0,
          sourceData: null,
          clinicalGap: "Data collection failed",
        },
        bloatingSeverity: {
          value: 0,
          sourceData: null,
          clinicalGap: "Data collection failed",
        },
        bowelHabitDissatisfaction: {
          value: null,
          sourceData: null,
          clinicalGap: "Data collection failed",
        },
        lifeInterference: {
          value: null,
          sourceData: null,
          clinicalGap: "Data collection failed",
        },
        totalScore: {
          value: 0,
          interpretation: "Unable to assess",
        },
      },
      bristolStoolScale: {
        value: 0,
        sourceData: null,
        interpretation: "Unable to assess",
        narrativeSummary: "Assessment incomplete",
      },
      ibsSubtype: {
        classification: null,
        reasoning: "Assessment incomplete",
        confidenceLevel: "Low",
        narrativeSummary: "Unable to determine subtype",
      },
    },
    missingInformation: {
      narrativeSummary: "Assessment incomplete due to system error",
      criticalGaps: ["Complete assessment data"],
      recommendedAssessments: ["Retry assessment"],
    },
    clinicalRecommendations: {
      narrativeSummary: "Unable to provide recommendations at this time",
      immediateActions: ["Retry assessment"],
      suggestedLabTests: [],
      dataCollectionNeeded: ["Complete symptom assessment"],
    },
    reliabilityAssessment: {
      narrativeSummary: "Assessment failed due to system error",
      limitingFactors: ["System error"],
      confidenceLevel: "Low",
    },
  };
}
