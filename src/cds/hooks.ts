import { Hono } from 'hono';
import logger from '../utils/logger';

export const hooksRouter = new Hono();

hooksRouter.post('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  logger.info('Received CDS Hook Request:', {
    serviceId: id,
    body,
  });

  try {
    // Validate the request
    if (!body.hook || !body.hookInstance || !body.context || !body.prefetch) {
      return c.json({ error: 'Invalid request: Missing required fields' }, 400);
    }

    const { patient, conditions, medications, allergies } = body.prefetch;

    // Validate prefetch data
    if (!patient || !patient.resourceType || patient.resourceType !== 'Patient') {
      return c.json({ error: 'Invalid prefetch data: Patient resource missing or invalid' }, 400);
    }

    if (!conditions || !conditions.resourceType || conditions.resourceType !== 'Bundle') {
      return c.json({ error: 'Invalid prefetch data: Conditions resource missing or invalid' }, 400);
    }

    if (!medications || !medications.resourceType || medications.resourceType !== 'Bundle') {
      return c.json({ error: 'Invalid prefetch data: Medications resource missing or invalid' }, 400);
    }

    if (!allergies || !allergies.resourceType || allergies.resourceType !== 'Bundle') {
      return c.json({ error: 'Invalid prefetch data: Allergies resource missing or invalid' }, 400);
    }
    // Handle different services based on the ID
    if (id === 'patient-greeter') {
      // Extract patient name
      const firstName = patient.name?.[0]?.given?.[0] || 'Patient';
      const lastName = patient.name?.[0]?.family || '';

      // Extract conditions
      const activeConditions = conditions.entry?.map((entry: { resource: { code: { text: any; }; }; }) => entry.resource?.code?.text).filter(Boolean) || [];

      // Extract medications
      const activeMedications = medications.entry?.map((entry: { resource: { medicationCodeableConcept: { text: any; }; }; }) => entry.resource?.medicationCodeableConcept?.text).filter(Boolean) || [];

      // Extract allergies
      const patientAllergies = allergies.entry?.map((entry: { resource: { substance: { text: any; }; }; }) => entry.resource?.substance?.text).filter(Boolean) || [];

      // Define a common source object
      const commonSource = {
        label: 'Patient Greeter Service',
        url: 'https://example.com',
        icon: 'https://example.com/icon.png',
      };

      // Define common suggestions and links
      const commonSuggestions = [
        {
          label: 'View Patient History',
          actions: [
            {
              type: 'create',
              description: 'Open the patient history report.',
              resource: {
                resourceType: 'DiagnosticReport',
                status: 'final',
                code: {
                  text: 'Patient History',
                },
                subject: {
                  reference: `Patient/${body.context.patientId}`,
                },
              },
            },
          ],
        },
      ];

      const commonLinks = [
        {
          label: 'Google',
          url: 'https://google.com',
          type: 'absolute',
        },
        {
          label: 'Launch Pnemocia Diagnosis App',
          url: 'http://localhost:4434/launch',
          type: 'smart',
        },
      ];

      // Build dynamic content for cards
      const cards = [
        {
          summary: `Dai, ${firstName} ${lastName}`,
          indicator: 'info',
          detail: 'You have pnemonia based on ChatGPT',
          source: commonSource,
          suggestions: commonSuggestions,
          links: commonLinks,
        },
      ];

      // Add a card for active conditions
      if (activeConditions.length > 0) {
        cards.push({
          summary: 'Active Conditions',
          indicator: 'warning',
          detail: `The patient has the following active conditions: ${activeConditions.join(', ')}.`,
          source: {
            label: 'Conditions CDS Service',
            url: 'https://example.com/conditions',
            icon: 'https://example.com/conditions-icon.png',
          },
          suggestions: commonSuggestions,
          links: commonLinks,
        });
      }

      // Add a card for active medications
      if (activeMedications.length > 0) {
        cards.push({
          summary: 'Active Medications',
          indicator: 'info',
          detail: `The patient is currently taking: ${activeMedications.join(', ')}.`,
          source: {
            label: 'Medications CDS Service',
            url: 'https://example.com/medications',
            icon: 'https://example.com/medications-icon.png',
          },
          suggestions: commonSuggestions,
          links: commonLinks,
        });
      }

      // Add a card for allergies
      if (patientAllergies.length > 0) {
        cards.push({
          summary: 'Allergies',
          indicator: 'info',
          detail: `The patient has allergies to: ${patientAllergies.join(', ')}.`,
          source: {
            label: 'Allergies CDS Service',
            url: 'https://example.com/allergies',
            icon: 'https://example.com/allergies-icon.png',
          },
          suggestions: commonSuggestions,
          links: commonLinks,
        });
      }

      logger.info('Sending CDS Hook Response:', { cards });
      return c.json({ cards });
    } else if (id === 'clinical-recommendations') {
      // Logic for clinical-recommendations service
      const activeConditions = conditions.entry?.map((entry: { resource: { code: { text: any; }; }; }) => entry.resource?.code?.text).filter(Boolean) || [];
      const activeMedications = medications.entry?.map((entry: { resource: { medicationCodeableConcept: { text: any; }; }; }) => entry.resource?.medicationCodeableConcept?.text).filter(Boolean) || [];
      const patientAllergies = allergies.entry?.map((entry: { resource: { substance: { text: any; }; }; }) => entry.resource?.substance?.text).filter(Boolean) || [];

      const response = {
          cards: [
              {
                  summary: 'Clinical Recommendations',
                  indicator: 'info',
                  detail: `The patient has the following active conditions: ${activeConditions.join(', ')}.`,
                  source: {
                      label: 'Clinical Recommendations Service',
                      url: 'https://example.com/clinical',
                      icon: 'https://example.com/clinical-icon.png',
                  },
                  suggestions: [],
                  links: [],
              },
          ],
      };

      return c.json(response);
  } else {
      return c.json({ error: 'Service not found' }, 404);
    }

  } catch (error) {
    logger.error('Error in hook route:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});