// src/cds/hooks.ts
import { Hono } from 'hono';
import logger from '../utils/logger';
import { IBSAssessment } from '../types/ibs';
import { predictIBSRisk } from '../utils/openaiClient';


export const hooksRouter = new Hono();

hooksRouter.post('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  logger.info({ serviceId: id, body }, 'Received CDS Hook Request:');

  try {
    // Validation checks
    if (!body.hook || !body.hookInstance || !body.context || !body.prefetch) {
      return c.json({ error: 'Invalid request: Missing required fields' }, 400);
    }

    if (id !== 'ibs-risk-assessment') {
      return c.json({ error: 'Service not found' }, 404);
    }

    const {
      patientData,
      conditions,
      observations,
      medications,
      procedures,
      questionnaire
    } = body.prefetch;

    if (!patientData || patientData.resourceType !== 'Patient') {
      return c.json({ error: 'Invalid prefetch data: Patient resource missing or invalid' }, 400);
    }

    const assessment: IBSAssessment = await predictIBSRisk({
      patient: patientData,
      conditions,
      observations,
      medications,
      procedures,
      questionnaire
    });

    const severityLevel = assessment.ibsSSS.totalScore > 300 ? 'severe' :
      assessment.ibsSSS.totalScore > 175 ? 'moderate' : 'mild';

    const cards = [];

    // Main Assessment Card - content varies by severity
    if (severityLevel === 'mild' && !assessment.romeIVCriteriaMet) {
      // Simple card for low risk/mild cases
      cards.push({
        summary: 'IBS Assessment: Low Risk',
        indicator: 'info',
        detail: `Based on the current assessment, there are no significant indicators of IBS. 
                        The patient's symptoms do not meet the ROME IV criteria for IBS diagnosis.
                        
                        Total Symptom Score: ${assessment.ibsSSS.totalScore}/500 (Mild)`,
        source: {
          label: 'IBS Clinical Decision Support',
          url: 'https://ibscare.limogi.ai',
          icon: 'https://ibscare.limogi.ai/icon.png',
        }
      });
    } else {
      // Detailed card for moderate/severe cases
      cards.push({
        summary: `IBS Assessment: ${severityLevel.toUpperCase()}`,
        indicator: severityLevel === 'severe' ? 'critical' : 'warning',
        detail: `
ROME IV Criteria: ${assessment.romeIVCriteriaMet ? 'Met' : 'Not Met'}
IBS Subtype: ${assessment.ibsSubtype || 'Unclassified'}
IBS-SSS Score: ${assessment.ibsSSS.totalScore}/500 (${severityLevel.charAt(0).toUpperCase() + severityLevel.slice(1)})

Symptom Breakdown:
• Abdominal Pain Severity: ${assessment.ibsSSS.abdominalPainSeverity}/100
• Pain Frequency: ${assessment.ibsSSS.abdominalPainFrequency}/100
• Bloating Severity: ${assessment.ibsSSS.bloatingSeverity}/100
• Bowel Habit Dissatisfaction: ${assessment.ibsSSS.bowelHabitDissatisfaction}/100
• Life Interference: ${assessment.ibsSSS.lifeInterference}/100

${assessment.bristolStoolScale ? `Bristol Stool Scale: Type ${assessment.bristolStoolScale}` : ''}
                `.trim(),
        source: {
          label: 'IBS Clinical Decision Support',
          url: 'https://ibscare.limogi.ai',
          icon: 'https://ibscare.limogi.ai/icon.png',
        },
        suggestions: [
          {
            label: 'Treatment Recommendations',
            actions: []
          }
        ],
        links: [
          {
            label: 'Launch IBS Care Dashboard',
            url: 'https://ibscare-app.limogi.ai/launch',
            type: 'smart',
          }
        ],
      });

      // Add Lab Tests Card for moderate/severe cases
      if (assessment.suggestedLabTests && assessment.suggestedLabTests.length > 0) {
        cards.push({
          summary: 'Recommended Laboratory Tests',
          indicator: severityLevel === 'severe' ? 'critical' : 'warning',
          detail: `Suggested tests to rule out other conditions:\n${assessment.suggestedLabTests.join('\n')}`,
          source: {
            label: 'IBS Clinical Decision Support',
            url: 'https://ibscare.limogi.ai',
            icon: 'https://ibscare.limogi.ai/icon.png',
          }
        });
      }

      // Add Recommendations Card for moderate/severe cases
      if (assessment.recommendations && assessment.recommendations.length > 0) {
        cards.push({
          summary: 'Clinical Recommendations',
          indicator: severityLevel === 'severe' ? 'critical' : 'warning',
          detail: assessment.recommendations.join('\n'),
          source: {
            label: 'IBS Clinical Decision Support',
            url: 'https://ibscare.limogi.ai',
            icon: 'https://ibscare.limogi.ai/icon.png',
          }
        });
      }
    }

    logger.info({ cards }, 'Sending IBS Assessment CDS Cards:');
    return c.json({ cards });

  } catch (error) {
    logger.error({ error }, 'Error in hook route:');
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});