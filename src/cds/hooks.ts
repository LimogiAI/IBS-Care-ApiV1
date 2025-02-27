// src/cds/hooks.ts
import { Hono } from "hono";
import logger from "../utils/logger";
import { IBSAssessmentShort } from "../types/ibs";
import { processFHIRResources } from "../utils/processFHIRResources";
import { shortIBSAssessment } from "../services/ibsAssessmentShortService";
import { config } from "../config";

export const hooksRouter = new Hono();

hooksRouter.post('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  logger.info({ serviceId: id }, 'Received CDS Hook Request');
  try {
    // Validation checks
    if (!body.hook || !body.hookInstance || !body.context || !body.prefetch) {
      return c.json({ error: 'Invalid request: Missing required fields' }, 400);
    }
    const bodyContext = body.context
    logger.info({ bodyContext}, 'body.context');

    if (id !== 'ibs-risk-assessment') {
      return c.json({ error: 'Service not found' }, 404);
    }

    // Extract necessary information
    const { patient } = body.prefetch;
    const processedData = processFHIRResources(body.prefetch);

    logger.info({ processedData }, "Processed FHIR Data");

    if (!processedData) {
      return c.json({ error: 'Invalid processed data' }, 400);
    }

    // Perform IBS Risk Analysis using OpenAI
    const assessment: IBSAssessmentShort = await shortIBSAssessment(processedData);

    const summaryEmoji = assessment.severityLevel === 'severe' ? '🚨'
      : assessment.severityLevel === 'moderate' ? '⚠️'
        : assessment.severityLevel === 'mild' ? 'ℹ️' : 'ℹ️';

    const hasMetIBSCriteria = assessment.meetsIBSCriteria ? 'has met IBS Criteria'
      : 'has NOT met IBS Criteria';

    const getPatientName = (pt: any) => {
      const nameInfo = pt?.name?.[0];
      if (!nameInfo) return 'Patient';
      const prefix = nameInfo.prefix?.[0] || '';
      const firstName = nameInfo.given?.[0] || 'Patient';
      const lastName = nameInfo.family || '';
      return `${prefix} ${firstName} ${lastName}`.trim();
    };

    const cards = [];



    // 🔹 **Display Mild Case Card (If IBS Symptoms Exist but Rome IV Criteria Not Met)**
    if (assessment?.severityLevel === 'mild') {
      cards.push({
        summary: `${summaryEmoji} IBS Risk Assessment Overview`,
        indicator: "info",
        detail: `🩺 ** ${getPatientName(patient)} ${hasMetIBSCriteria} **.
        ➤ Reasoning:- ${assessment?.reasoning || 'Not Available'}.
        ➤ Additional Notes:- ${assessment?.notes || 'Consider Launching the App for Detailed Analysis'}.
        ⚠️ *** Disclaimer: *** This assessment is for informational purposes and does not constitute medical advice.  
         *** Consider launching the IBS Care Dashboard for further evaluation. *** 👉 `,
        source: {
          label: "Rome Foundation, Inc",
          url: "https://theromefoundation.org/",
          icon: "https://theromefoundation.org/wp-content/uploads/2016/02/Rome-logo@2x.png",
        },
        links: [
          {
            label: "🚀 Launch IBS Care Dashboard",
            url: `${config.ehrLaunchAppBaseUrl}/launch`,
            type: "smart",
          },
        ],
      });
    }

    // 🟡 **Display Moderate IBS Risk Card**
    else if (assessment?.severityLevel === 'moderate') {
      cards.push({
        summary: `${summaryEmoji} IBS Risk Assessment Overview`,
        indicator: "warning",
        detail: `🩺 ** ${getPatientName(patient)} ${hasMetIBSCriteria} **. 
        ➤ Reasoning:- ${assessment?.reasoning || 'Not Available'}.
        ➤ Additional Notes:- ${assessment?.notes || 'Consider Launching the App for Detailed Analysis'}.
        ⚠️ *** Disclaimer: *** This assessment is for informational purposes and does not constitute medical advice.  
         *** Consider launching the IBS Care Dashboard for further evaluation. *** 👉 `,
        source: {
          label: "Rome Foundation, Inc",
          url: "https://theromefoundation.org/",
          icon: "https://theromefoundation.org/wp-content/uploads/2016/02/Rome-logo@2x.png",
        },
        links: [
          {
            label: "🚀 Launch IBS Care Dashboard",
            url: `${config.ehrLaunchAppBaseUrl}/launch`,
            type: "smart",
          },
        ],
      });
    }

    // 🔴 **Display Severe IBS Risk Card**
    else if (assessment?.severityLevel === 'severe') {
      cards.push({
        summary: `${summaryEmoji} IBS Risk Assessment Overview`,
        indicator: "critical",
        detail: `🩺 ** ${getPatientName(patient)} ${hasMetIBSCriteria} **.  
        ➤ Reasoning:- ${assessment?.reasoning || 'Not Available'}.
        ➤ Additional Notes:- ${assessment?.notes || 'Consider Launching the App for Detailed Analysis'}.
        ⚠️ *** Disclaimer: *** This assessment is for informational purposes and does not constitute medical advice.  
         *** Consider launching the IBS Care Dashboard for further evaluation. *** 👉 `,
        source: {
          label: "Rome Foundation, Inc",
          url: "https://theromefoundation.org/",
          icon: "https://theromefoundation.org/wp-content/uploads/2016/02/Rome-logo@2x.png",
        },
        links: [
          {
            label: "🚀 Launch IBS Care Dashboard",
            url: `${config.ehrLaunchAppBaseUrl}/launch`,
            type: "smart",
          },
        ],
      });
    }

    // 🟢 ** Display an Information Card** (For all other cases)
    else {
      cards.push({
        summary: `${summaryEmoji} IBS Risk Assessment Overview`,
        indicator: "info",
        detail: `🩺 ** ${getPatientName(patient)} ${hasMetIBSCriteria} **. 
        ➤ Reasoning:- ${assessment?.reasoning || 'Not Available'}.
        ➤ Additional Notes:- ${assessment?.notes || 'Consider Launching the App for Detailed Analysis'}.
        ⚠️ *** Disclaimer: *** This assessment is for informational purposes and does not constitute medical advice.  
         *** Consider launching the IBS Care Dashboard for further evaluation. *** 👉 `,
        source: {
          label: "Rome Foundation, Inc",
          url: "https://theromefoundation.org/",
          icon: "https://theromefoundation.org/wp-content/uploads/2016/02/Rome-logo@2x.png",
        },
        links: [
          {
            label: "🚀 Launch IBS Care Dashboard",
            url: `${config.ehrLaunchAppBaseUrl}/launch`,
            type: "smart",
          },
        ],
      });
    }

    logger.info({ cards }, "Sending IBS Assessment CDS Cards");
    return c.json({ cards });

  } catch (error) {
    logger.error({ error }, "Error in hook route");
    return c.json({ error: "Internal Server Error" }, 500);
  }
});
