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
                    patientData: "Patient/{{context.patientId}}",
                    // IBS and Related Conditions
                    conditions: "Condition?patient={{context.patientId}}&code=K58.0,K58.1,K58.2,K58.8,K58.9,K59.0,K59.1,R10.0,R10.1,R10.2,R10.3,R10.4,R14.0,R14.1,R14.2,R19.4,F45.8",
                    // Relevant Observations including BSS and symptoms
                    observations: "Observation?patient={{context.patientId}}&code=74453004,405729008,62315008,422587007,422400008,398033008,70153002",
                    // Medications for IBS and related conditions
                    medications: "MedicationRequest?patient={{context.patientId}}&category=IBS,antispasmodic,antidiarrheal,laxative",
                    // Procedures including colonoscopy, endoscopy
                    procedures: "Procedure?patient={{context.patientId}}&code=73761001,235714003",
                    // Allergies that might affect IBS
                    allergies: "AllergyIntolerance?patient={{context.patientId}}",
                    // ROME IV questionnaire responses
                    questionnaire: "QuestionnaireResponse?patient={{context.patientId}}&questionnaire=ROME_IV_IBS,IBS_SSS",
                    // Clinical impressions
                    clinicalImpression: "ClinicalImpression?patient={{context.patientId}}"
                },
            },
        ];

        return c.json({ services });
    } catch (error) {
        logger.error('Error in discovery route:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
