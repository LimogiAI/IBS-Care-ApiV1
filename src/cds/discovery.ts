// src/cds/discovery.ts
import { Hono } from 'hono';
import logger from '../utils/logger';

export const discoveryRouter = new Hono();

discoveryRouter.get('/', (c) => {
    try {
        const services = [
            {
                hook: 'patient-view',
                title: 'IBS Risk Assessment Service',
                description: 'Evaluates IBS risk using ROME IV criteria and IBS-SSS scoring system with AI-assisted analysis.',
                id: 'ibs-risk-assessment',
                prefetch: {
                    patient: "Patient/{{context.patientId}}",
                    condition: "Condition?patient={{context.patientId}}", //Fetching max 10 only 
                    observation: "Observation?patient={{context.patientId}}", //Fetching max 10 only 
                    encounter: "Encounter?patient={{context.patientId}}",
                    clinicalimpression: "ClinicalImpression?patient={{context.patientId}}",
                    diagnosticreport: "DiagnosticReport?patient={{context.patientId}}",
                    questionnaire: "Questionnaire?patient={{context.patientId}}",
                    questionnaireresponse: "QuestionnaireResponse?patient={{context.patientId}}",
                    // ✅ NEWLY ADDED RESOURCES FOR DIFFERENTIAL DIAGNOSIS
                    "medications": "MedicationRequest?patient={{context.patientId}}",
                    "procedures": "Procedure?patient={{context.patientId}}",
                    "allergies": "AllergyIntolerance?patient={{context.patientId}}",
                },
            },
        ];

        return c.json({ services });
    } catch (error) {
        logger.error('Error in discovery route:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
