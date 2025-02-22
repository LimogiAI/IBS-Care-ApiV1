// src/utils/defaultAssessmentsShort.ts
// import { IBSAssessmentShort } from "../types/ibs";

// export function getDefaultAssessmentShort(): IBSAssessmentShort {
//   return {
//     romeIVCriteriaMet: false,
//     ibsSSS: {
//       abdominalPainSeverity: 0,
//       abdominalPainFrequency: 0,
//       bloatingSeverity: 0,
//       bowelHabitDissatisfaction: 0,
//       lifeInterference: 0,
//       totalScore: 0
//     },
//     ibsSubtype: "N/A",
//     recommendations: ["Further assessment required: Additional patient history and lab tests may be needed."],
//     explanation: "IBS diagnosis could not be determined due to insufficient clinical data. Consider additional laboratory tests (CBC, CRP, ESR) and imaging (colonoscopy).",
//     missingData: ["Lab Tests", "Bristol Stool Scale", "Patient History"]
//   };
// }

import { IBSAssessmentShort } from "../types/ibs";

export function getDefaultAssessmentShort(): IBSAssessmentShort {
  return {
    "meetsIBSCriteria": false,
    "reasoning": "The provided FHIR data does not contain specific information to assess if the Rome IV criteria for IBS are met.",
    "ibsSubtype": "UNDETERMINED",
    "severityLevel": "undetermined"
  };
}
