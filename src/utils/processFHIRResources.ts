import { ProcessedFHIRData } from "../types/ibs";

// Helper function to calculate age
function calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Main function to process FHIR data
export function processFHIRResources(prefetch: any): ProcessedFHIRData {
    const processed: ProcessedFHIRData = {
        patient: {
            id: prefetch.patient?.id || 'unknown',
            gender: prefetch.patient?.gender,
            age: prefetch.patient?.birthDate ? calculateAge(prefetch.patient.birthDate) : undefined,
            birthDate: prefetch.patient?.birthDate,
        },
        fhirResources: {}
    };

    // Process Condition
    if (prefetch.condition?.entry) {
        processed.fhirResources.conditions = prefetch.condition.entry.map((entry: any) => ({
            id: entry.resource?.id,
            code: entry.resource?.code?.coding?.[0]?.code,
            display: entry.resource?.code?.coding?.[0]?.display,
            onset: entry.resource?.onsetDateTime,
            status: entry.resource?.clinicalStatus?.coding?.[0]?.code
        }));
    }

    // Process Observations
    if (prefetch.observation?.entry) {
        processed.fhirResources.observations = prefetch.observation.entry.map((entry: any) => ({
            id: entry.resource?.id,
            code: entry.resource?.code?.coding?.[0]?.code,
            display: entry.resource?.code?.coding?.[0]?.display,
            value: entry.resource?.valueQuantity?.value || entry.resource?.valueString || entry.resource?.valueBoolean,
            effectiveDateTime: entry.resource?.effectiveDateTime
        }));
    }

    // Process Encounters
    if (prefetch.encounter?.entry) {
        processed.fhirResources.encounters = prefetch.encounter.entry.map((entry: any) => ({
            id: entry.resource?.id,
            type: entry.resource?.type?.[0]?.text,
            date: entry.resource?.period?.start,
            diagnoses: entry.resource?.diagnosis?.map((d: any) => ({
                code: d.condition?.coding?.[0]?.code,
                display: d.condition?.coding?.[0]?.display
            }))
        }));
    }

    // Process Clinical Impressions
    if (prefetch.clinicalimpression?.entry) {
        processed.fhirResources.clinicalImpressions = prefetch.clinicalimpression.entry.map((entry: any) => ({
            id: entry.resource?.id,
            description: entry.resource?.description,
            date: entry.resource?.date,
            finding: entry.resource?.finding?.map((f: any) => ({
                code: f.item?.coding?.[0]?.code,
                display: f.item?.coding?.[0]?.display
            }))
        }));
    }

    // Process Diagnostic Reports
    if (prefetch.diagnosticreport?.entry) {
        processed.fhirResources.diagnosticReports = prefetch.diagnosticreport.entry.map((entry: any) => ({
            id: entry.resource?.id,
            code: entry.resource?.code?.coding?.[0]?.code,
            display: entry.resource?.code?.coding?.[0]?.display,
            result: entry.resource?.conclusion || entry.resource?.result,
            issued: entry.resource?.issued
        }));
    }

    // Process Questionnaires
    if (prefetch.questionnaire?.entry) {
        processed.fhirResources.questionnaires = prefetch.questionnaire.entry.map((entry: any) => ({
            id: entry.resource?.id,
            title: entry.resource?.title,
            questions: entry.resource?.item?.map((q: any) => ({
                question: q.text,
                answer: null
            }))
        }));
    }

    // Process Questionnaire Responses
    if (prefetch.questionnaireresponse?.entry) {
        processed.fhirResources.questionnaireResponses = prefetch.questionnaireresponse.entry.map((entry: any) => ({
            id: entry.resource?.id,
            questionnaireId: entry.resource?.questionnaire,
            responses: entry.resource?.item?.map((r: any) => ({
                question: r.linkId,
                answer: r.answer?.[0]?.valueString || r.answer?.[0]?.valueBoolean || r.answer?.[0]?.valueInteger
            }))
        }));
    }

    // Process Medications
    if (prefetch.medications?.entry) {
        processed.fhirResources.medications = prefetch.medications.entry.map((entry: any) => ({
            id: entry.resource?.id,
            medicationCode: entry.resource?.medicationCodeableConcept?.coding?.[0]?.code,
            display: entry.resource?.medicationCodeableConcept?.coding?.[0]?.display,
            status: entry.resource?.status,
            date: entry.resource?.authoredOn
        }));
    }

    // Process Procedures
    if (prefetch.procedures?.entry) {
        processed.fhirResources.procedures = prefetch.procedures.entry.map((entry: any) => ({
            id: entry.resource?.id,
            code: entry.resource?.code?.coding?.[0]?.code,
            display: entry.resource?.code?.coding?.[0]?.display,
            performedDateTime: entry.resource?.performedDateTime
        }));
    }

    // Process Allergies
    if (prefetch.allergies?.entry) {
        processed.fhirResources.allergies = prefetch.allergies.entry.map((entry: any) => ({
            id: entry.resource?.id,
            code: entry.resource?.code?.coding?.[0]?.code,
            display: entry.resource?.code?.coding?.[0]?.display,
            category: entry.resource?.category,
            criticality: entry.resource?.criticality,
            onset: entry.resource?.onsetDateTime
        }));
    }

    return processed;
}




// import { ProcessedFHIRData } from "../types/ibs";

// // Interface for FHIR prefetch data
// interface PrefetchData {
//     patient: any;
//     condition: any;
//     observation: any;
//     encounter: any;
//     task: any;
//     allergies: any;
// }

// // Constants for IBS-related codes
// const IBS_CONDITION_CODES = [
//     'K58.0', // IBS with diarrhea
//     'K58.1', // IBS with constipation
//     'K58.2', // Mixed IBS
//     'K58.8', // Other IBS
//     'K58.9'  // IBS without diarrhea
// ];

// const RELATED_CONDITION_CODES = [
//     'K59.0', // Constipation
//     'K59.1', // Functional diarrhea
//     'R10.0', // Acute abdomen
//     'R10.1', // Pain localized to upper abdomen
//     'R10.2', // Pelvic and perineal pain
//     'R10.3', // Pain localized to other parts of lower abdomen
//     'R10.4', // Other and unspecified abdominal pain
//     'R14.0', // Abdominal distension (gaseous)
//     'R14.1', // Gas pain
//     'R14.2', // Eructation
//     'R19.4', // Change in bowel habit
//     'F45.8'  // Other somatoform disorders
// ];

// // ROME IV diagnostic criteria codes
// const ROME_IV_CODES = {
//     // Core Symptoms
//     RECURRENT_ABDOMINAL_PAIN: '21522001',
//     ABDOMINAL_PAIN: '74453004',
//     DEFECATION_CHANGES: 'K59.8',
    
//     // Supporting Symptoms
//     BLOATING: '405729008',
//     DISTENSION: 'R14.0',
//     BRISTOL_STOOL: '398033008',
    
//     // Associated Symptoms
//     NAUSEA: '422587007',
//     FATIGUE: '84229001',
//     EARLY_SATIETY: '249472009',
//     DYSPEPSIA: 'K30',
    
//     // Psychological Factors
//     ANXIETY: 'F41.9',
//     DEPRESSION: 'F32.9',
//     STRESS: 'Z73.3'
// };

// // Helper function to get associated symptoms
// function getAssociatedSymptom(code: string): string | null {
//     const associatedSymptoms: { [key: string]: string } = {
//         [ROME_IV_CODES.NAUSEA]: 'nausea',
//         [ROME_IV_CODES.FATIGUE]: 'fatigue',
//         [ROME_IV_CODES.EARLY_SATIETY]: 'early_satiety',
//         [ROME_IV_CODES.DYSPEPSIA]: 'dyspepsia',
//         [ROME_IV_CODES.ANXIETY]: 'anxiety',
//         [ROME_IV_CODES.DEPRESSION]: 'depression',
//         [ROME_IV_CODES.STRESS]: 'stress'
//     };
//     return associatedSymptoms[code] || null;
// }

// // Helper function to calculate age
// function calculateAge(birthDate: string): number {
//     if (!birthDate) return 0;
//     const today = new Date();
//     const birth = new Date(birthDate);
//     let age = today.getFullYear() - birth.getFullYear();
//     const monthDiff = today.getMonth() - birth.getMonth();
    
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//         age--;
//     }
    
//     return age;
// }

// // Main processing function
// export function processFHIRResources(prefetch: PrefetchData): ProcessedFHIRData {
//     const processed: ProcessedFHIRData = {
//         patient: { id: prefetch.patient?.id || 'unknown' },
//         ibsSymptoms: {},
//         relevantConditions: [],
//         encounters: []
//     };

//     // Process Patient Data
//     if (prefetch.patient) {
//         processed.patient = {
//             id: prefetch.patient.id,
//             gender: prefetch.patient.gender,
//             age: calculateAge(prefetch.patient.birthDate)
//         };
//     }

//     // Process condition
//     if (prefetch.condition?.entry) {
//         processed.relevantConditions = prefetch.condition.entry
//             .map((entry: any) => {
//                 const condition = entry.resource;
//                 if (!condition) return null;

//                 // Look for both ICD-10 and SNOMED CT codes
//                 const icdCoding = condition.code?.coding?.find((coding: any) => 
//                     coding.system === "http://hl7.org/fhir/sid/icd-10");
//                 const snomedCoding = condition.code?.coding?.find((coding: any) => 
//                     coding.system === "http://snomed.info/sct");
                
//                 const code = icdCoding?.code || snomedCoding?.code;
//                 const display = icdCoding?.display || snomedCoding?.display;

//                 if (IBS_CONDITION_CODES.includes(code) || RELATED_CONDITION_CODES.includes(code)) {
//                     return {
//                         code,
//                         display,
//                         onset: condition.onsetDateTime,
//                         status: condition.clinicalStatus?.coding?.[0]?.code
//                     };
//                 }
//                 return null;
//             })
//             .filter(Boolean);
//     }

//   // Fixed Encounters Processing
// if (prefetch.encounter?.entry) {
//     processed.encounters = prefetch.encounter.entry
//         .map((entry: any) => {
//             const encounter = entry.resource;
//             if (!encounter) return null;

//             return {
//                 types: encounter.type?.map((t: any) => ({
//                     codings: t.coding?.map((c: any) => ({
//                         system: c.system,
//                         code: c.code,
//                         display: c.display
//                     }))
//                 })),
//                 date: encounter.period?.start,
//                 diagnoses: encounter.diagnosis?.map((d: any) => ({
//                     condition: d.condition?.reference,
//                     rank: d.rank,
//                     coding: d.use?.coding?.map((c: any) => ({
//                         system: c.system,
//                         code: c.code,
//                         display: c.display
//                     }))
//                 }))
//             };
//         })
//         .filter(Boolean);
// }

//     // Process Tasks
//     if (prefetch.task?.entry) {
//         processed.tasks = prefetch.task.entry
//             .map((entry: any) => {
//                 const task = entry.resource;
//                 if (!task) return null;

//                 return {
//                     id: task.id,
//                     status: task.status,
//                     intent: task.intent,
//                     description: task.description,
//                     authoredOn: task.authoredOn,
//                     lastModified: task.lastModified
//                 };
//             })
//             .filter(Boolean);
//     }

//    // Fixed Allergies Processing
// if (prefetch.allergies?.entry) {
//     processed.allergies = prefetch.allergies.entry
//         .map((entry: any) => {
//             const allergy = entry.resource;
//             if (!allergy) return null;

//             // Get all codings
//             const codings = allergy.code?.coding || [];
//             const categories = allergy.category || [];

//             return {
//                 codes: codings.map((coding: any) => ({
//                     code: coding.code,
//                     system: coding.system,
//                     display: coding.display
//                 })),
//                 categories: categories.map((cat: any) => ({
//                     coding: cat.coding?.map((c: any) => ({
//                         system: c.system,
//                         code: c.code,
//                         display: c.display
//                     }))
//                 })),
//                 type: allergy.type,
//                 criticality: allergy.criticality,
//                 onset: allergy.onsetDateTime,
//                 clinicalStatus: allergy.clinicalStatus?.coding?.map((c: any) => ({
//                     system: c.system,
//                     code: c.code,
//                     display: c.display
//                 }))
//             };
//         })
//         .filter(Boolean);
// }

// // Fixed Observations Processing
// if (prefetch.observation?.entry) {
//     prefetch.observation.entry.forEach((entry: any) => {
//         const obs = entry.resource;
//         if (!obs) return;

//         // Get all coding entries with their systems
//         const codings = obs.code?.coding || [];
        
//         codings.forEach((coding: any) => {
//             const code = coding.code;
//             const system = coding.system;
            
//             // Get all components for reuse
//             const components = obs.component || [];
            
//             // Helper function to find component values
//             const findComponentValue = (componentCode: string) => {
//                 return components.find((c: any) => 
//                     c.code?.coding?.some((coding: any) => 
//                         coding.code === componentCode
//                     )
//                 )?.valueQuantity?.value;
//             };

//             // 1. Abdominal Pain Assessment
//             if ((system === 'http://snomed.info/sct' && 
//                 (code === ROME_IV_CODES.ABDOMINAL_PAIN || 
//                  code === ROME_IV_CODES.RECURRENT_ABDOMINAL_PAIN))) {
                
//                 if (!processed.ibsSymptoms.abdominalPain) {
//                     processed.ibsSymptoms.abdominalPain = [];
//                 }

//                 processed.ibsSymptoms.abdominalPain.push({
//                     value: obs.valueQuantity?.value || 0,
//                     date: obs.effectiveDateTime,
//                     duration: findComponentValue('duration'),
//                     frequency: findComponentValue('frequency'),
//                     system: system,
//                     code: code,
//                     display: coding.display
//                 });
//             }

//             // 2. Bloating and Distension Assessment
//             if ((system === 'http://snomed.info/sct' && 
//                 (code === ROME_IV_CODES.BLOATING || 
//                  code === ROME_IV_CODES.DISTENSION))) {
                
//                 if (!processed.ibsSymptoms.bloating) {
//                     processed.ibsSymptoms.bloating = [];
//                 }

//                 processed.ibsSymptoms.bloating.push({
//                     value: obs.valueQuantity?.value || 0,
//                     date: obs.effectiveDateTime,
//                     type: code === ROME_IV_CODES.BLOATING ? 'bloating' : 'distension'
//                 });
//             }

//             // 3. Stool Characteristics Assessment
//             if (system === 'http://snomed.info/sct' && 
//                 code === ROME_IV_CODES.BRISTOL_STOOL) {
                
//                 if (!processed.ibsSymptoms.stoolCharacteristics) {
//                     processed.ibsSymptoms.stoolCharacteristics = [];
//                 }

//                 processed.ibsSymptoms.stoolCharacteristics.push({
//                     type: obs.valueInteger || 0,
//                     date: obs.effectiveDateTime,
//                     frequency: findComponentValue('frequency')
//                 });
//             }

//             // 4. Associated Symptoms Assessment
//             const associatedSymptom = getAssociatedSymptom(code);
//             if (associatedSymptom) {
//                 if (!processed.ibsSymptoms.associatedSymptoms) {
//                     processed.ibsSymptoms.associatedSymptoms = [];
//                 }

//                 processed.ibsSymptoms.associatedSymptoms.push({
//                     type: associatedSymptom,
//                     value: obs.valueQuantity?.value || 0,
//                     date: obs.effectiveDateTime
//                 });
//             }
//         });
//     });
// }


//     return processed;
// }