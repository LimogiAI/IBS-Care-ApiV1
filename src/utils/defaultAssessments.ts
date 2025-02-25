// src/utils/defaultAssessments.ts
import { IBSAssessment, PredictabilityResponse } from "../types/ibs";

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

// Default response for IBS Predictability AI
export function getDefaultPredictabilityResponse(): PredictabilityResponse {
  return {
    predictabilitySummary: "Unable to determine IBS progression at this time due to system error.",
    symptomTrend: {
      abdominalPain: "Stable",
      bloating: "Stable",
      diarrhea: "Stable",
      constipation: "Stable",
    },
    riskFactors: ["Insufficient data for analysis"],
    recommendations: {
      lifestyleChanges: ["Consult a healthcare provider for further assessment"],
      followUpAssessments: ["Reattempt assessment with complete data"],
    },
    confidenceLevel: "Low",
  };
}