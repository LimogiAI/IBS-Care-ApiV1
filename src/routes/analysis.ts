// src/routes/analysis.ts

import { Hono } from "hono";
import logger from "../utils/logger";
import { evidenceBasedIBSAssessment } from "../services/ibsAssessmentService";

export const analysisRouter = new Hono();

analysisRouter.post("/evidence-based", async (c) => {
    try {
        const fhirData = await c.req.json();

        if (!fhirData) {
            logger.warn("No FHIR data received");
            return c.json({ error: "No FHIR data provided" }, 400);
        }

        logger.info("Received FHIR data for evidence-based IBS analysis");
        const assessment = await evidenceBasedIBSAssessment(fhirData);

        logger.info("Returning IBS assessment result");
        return c.json(assessment, 200);
    } catch (error) {
        logger.error({ error }, "Error processing evidence-based IBS analysis");
        return c.json({ error: "Internal Server Error" }, 500);
    }
});


//predicticitve based comprehensive analysis
// analysisRouter.post('/predective-based', async (c) => {
//     try {
//         const body = await c.req.json();
//         const { patientId, fhirData } = body;

//         if (!patientId || !fhirData) {
//             return c.json({ error: 'Invalid request data' }, 400);
//         }

//         logger.info(`Processing IBS Analysis for Patient: ${patientId}`);

//         // AI-based IBS prediction
//         const assessment = await evidenceBasedIBSRisk(fhirData);

//         // Save in PostgreSQL
//         const query = `
//             INSERT INTO ibs_analysis (
//                 patient_id,
//                 overall_summary,
//                 clinical_assessment,
//                 missing_information,
//                 clinical_recommendations,
//                 reliability_assessment
//             )
//             VALUES ($1, $2, $3, $4, $5, $6)
//             RETURNING *;
//         `;

//         const values = [
//             patientId,
//             assessment.overallNarrativeSummary,
//             assessment.clinicalAssessment,
//             assessment.missingInformation,
//             assessment.clinicalRecommendations,
//             assessment.reliabilityAssessment
//         ];

//         const result = await db.query(query, values);
//         const savedAnalysis = result.rows[0];

//         // Cache result for quick retrieval
//         await redis.set(
//             `ibs-analysis:${patientId}`,
//             JSON.stringify(savedAnalysis),
//             'EX',
//             3600 // 1 hour expiration
//         );

//         logger.info(`Successfully saved analysis for patient: ${patientId}`);
//         return c.json(savedAnalysis);

//     } catch (error) {
//         logger.error('Error in IBS analysis:', error);
//         return c.json({ error: 'Internal Server Error' }, 500);
//     }
// });
