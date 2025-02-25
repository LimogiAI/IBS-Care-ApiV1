// src/types/ibs.ts
export interface IBSAssessment {
    overallNarrativeSummary: string;
    clinicalAssessment: {
        romeIVCriteriaMet: boolean;
        narrativeSummary: string | null;
        ibsSSS: {
            narrativeSummary: string;
            abdominalPainSeverity: {
                value: number;
                sourceData: string | null;
                clinicalGap: string | null;
            };
            abdominalPainFrequency: {
                value: number;
                sourceData: string | null;
                clinicalGap: string | null;
            };
            bloatingSeverity: {
                value: number;
                sourceData: string | null;
                clinicalGap: string | null;
            };
            bowelHabitDissatisfaction: {
                value: number | null;
                sourceData: string | null;
                clinicalGap: string | null;
            };
            lifeInterference: {
                value: number | null;
                sourceData: string | null;
                clinicalGap: string | null;
            };
            totalScore: {
                value: number;
                interpretation: string | null;
            };
        };
        bristolStoolScale: {
            value: number;
            sourceData: string | null;
            interpretation: string | null;
            narrativeSummary: string | null;
        };
        ibsSubtype: {
            classification: "IBS-C" | "IBS-D" | "IBS-M" | "IBS-U" | null;
            reasoning: string | null;
            confidenceLevel: string | null;
            narrativeSummary: string | null;
        };
    };
    missingInformation: {
        narrativeSummary: string | null;
        criticalGaps: string[];
        recommendedAssessments: string[];
    };
    clinicalRecommendations: {
        narrativeSummary: string | null;
        immediateActions: string[];
        suggestedLabTests: string[];
        dataCollectionNeeded: string[];
    };
    reliabilityAssessment: {
        narrativeSummary: string | null;
        limitingFactors: string[];
        confidenceLevel: string | null;
    };
}

export interface IBSAssessmentShort {
    meetsIBSCriteria: boolean;
    ibsSubtype: "IBS-C" | "IBS-D" | "IBS-M" | "IBS-U" | "UNDETERMINED";
    reasoning: string;
    severityLevel: "mild" | "moderate" | "severe" | "undetermined";
    notes?: string;
}

export interface ProcessedFHIRData {
    patient: {
        id: string;
        gender?: string;
        age?: number;
        birthDate?: string;
    };
    fhirResources: {
        conditions?: Array<{
            id?: string;
            code?: string;
            display?: string;
            onset?: string;
            status?: string;
        }>;
        observations?: Array<{
            id?: string;
            code?: string;
            display?: string;
            value?: any;
            effectiveDateTime?: string;
        }>;
        encounters?: Array<{
            id?: string;
            type?: string;
            date?: string;
            diagnoses?: Array<{ code?: string; display?: string }>;
        }>;
        clinicalImpressions?: Array<{
            id?: string;
            description?: string;
            date?: string;
            finding?: Array<{ code?: string; display?: string }>;
        }>;
        diagnosticReports?: Array<{
            id?: string;
            code?: string;
            display?: string;
            result?: any;
            issued?: string;
        }>;
        questionnaires?: Array<{
            id?: string;
            title?: string;
            questions?: Array<{ question?: string; answer?: string }>;
        }>;
        questionnaireResponses?: Array<{
            id?: string;
            questionnaireId?: string;
            responses?: Array<{ question?: string; answer?: string }>;
        }>;
        medications?: Array<{
            id?: string;
            medicationCode?: string;
            display?: string;
            status?: string;
            date?: string;
        }>;
        procedures?: Array<{
            id?: string;
            code?: string;
            display?: string;
            performedDateTime?: string;
        }>;
        allergies?: Array<{
            id?: string;
            code?: string;
            display?: string;
            category?: string;
            criticality?: string;
            onset?: string;
        }>;
    };
}

export interface PredictabilityResponse {
    predictabilitySummary: string; // Overall AI assessment of IBS trend
    symptomTrend: {
        abdominalPain: "Increasing" | "Stable" | "Decreasing";
        bloating: "Increasing" | "Stable" | "Decreasing";
        diarrhea: "Increasing" | "Stable" | "Decreasing";
        constipation: "Increasing" | "Stable" | "Decreasing";
    };
    riskFactors: string[]; // List of key factors contributing to worsening symptoms
    recommendations: {
        lifestyleChanges: string[]; // Suggested lifestyle/dietary modifications
        followUpAssessments: string[]; // Recommended medical tests or checkups
    };
    confidenceLevel: "High" | "Medium" | "Low"; // AI confidence in prediction
}

