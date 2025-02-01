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
        ];

        return c.json({ services });
    } catch (error) {
        logger.error('Error in discovery route:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
