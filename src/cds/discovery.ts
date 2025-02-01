import { Hono } from 'hono';
import logger from '../utils/logger';

export const discoveryRouter = new Hono();

discoveryRouter.get('/', (c) => {
    try {
        const services = [
            {
                hook: 'patient-view',
                title: 'Patient Greeter Service',
                description: 'Greets the patient and provides recommendations based on their data.',
                id: 'patient-greeter',
                prefetch: {
                    patient: "Patient/{{context.patientId}}",
                    conditions: "Condition?patient={{context.patientId}}&category=problem-list-item",
                    medications: "MedicationRequest?patient={{context.patientId}}&status=active",
                    allergies: "AllergyIntolerance?patient={{context.patientId}}"
                },
            },
            {
                hook: 'patient-view',
                title: 'Clinical Recommendations Service',
                description: 'Provides clinical recommendations based on patient data.',
                id: 'clinical-recommendations',
                prefetch: {
                    patient: "Patient/{{context.patientId}}",
                    conditions: "Condition?patient={{context.patientId}}&category=problem-list-item",
                    medications: "MedicationRequest?patient={{context.patientId}}&status=active",
                    allergies: "AllergyIntolerance?patient={{context.patientId}}"
                },
            },
            {
                hook: 'patient-view',
                title: 'IBS Risk Assessment Service',
                description: 'Evaluates the risk of Irritable Bowel Syndrome (IBS) using patient data and AI predictions.',
                id: 'ibs-risk-assessment',
                prefetch: {
                    // Adjust the prefetch parameters based on the FHIR data needed for IBS risk analysis.
                    patientData: "Patient/{{context.patientId}}",
                    // You might also include other FHIR resources relevant to IBS, like lab results or observations:
                    observations: "Observation?patient={{context.patientId}}&code=IBS_related_code"
                },
            },
        ];

        return c.json({ services });
    } catch (error) {
        logger.error('Error in discovery route:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
