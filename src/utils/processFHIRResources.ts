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

    // // Process Questionnaire Responses
    // if (prefetch.questionnaireresponse?.entry) {
    //     processed.fhirResources.questionnaireResponses = prefetch.questionnaireresponse.entry.map((entry: any) => ({
    //         id: entry.resource?.id,
    //         questionnaireId: entry.resource?.questionnaire,
    //         responses: entry.resource?.item?.map((r: any) => ({
    //             question: r.linkId,
    //             answer: r.answer?.[0]?.valueString || r.answer?.[0]?.valueBoolean || r.answer?.[0]?.valueInteger
    //         }))
    //     }));
    // }

    if (prefetch.questionnaireresponse?.entry) {
        processed.fhirResources.questionnaireResponses = prefetch.questionnaireresponse.entry.map((entry: any) => ({
            id: entry.resource?.id,
            questionnaireId: entry.resource?.questionnaire,
            responses: entry.resource?.item?.flatMap((section: any) =>
                section.item?.map((question: any) => ({
                    question: question.linkId,
                    answer: question.answer?.[0]?.valueString || 
                            question.answer?.[0]?.valueBoolean || 
                            question.answer?.[0]?.valueInteger
                })) || []
            ).filter((response: { question: string; answer?: string | boolean | number }) => response.question) // Type added here
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