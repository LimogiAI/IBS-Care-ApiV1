// src/types/ibs.ts
export interface IBSAssessment {
    romeIVCriteriaMet: boolean;
    ibsSSS: {
      abdominalPainSeverity: number;
      abdominalPainFrequency: number;
      bloatingSeverity: number;
      bowelHabitDissatisfaction: number;
      lifeInterference: number;
      totalScore: number;
    };
    bristolStoolScale?: number;
    ibsSubtype?: 'IBS-C' | 'IBS-D' | 'IBS-M' | 'IBS-U';
    recommendations: string[];
    suggestedLabTests?: string[];
  }