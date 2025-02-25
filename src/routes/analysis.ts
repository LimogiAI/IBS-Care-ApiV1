// src/routes/analysis.ts

import { Hono } from "hono";
import logger from "../utils/logger";
import { evidenceBasedIBSAssessment, predictIBSOutcome } from "../services/ibsAssessmentService";

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


analysisRouter.post("/predictability-ai", async (c) => {
    try {
        const requestData = await c.req.json();

        if (!requestData || !requestData.fhirData || !requestData.qolResponses) {
            logger.warn("Missing required input data (FHIR or QoL responses)");
            return c.json({ error: "FHIR data and QoL responses are required" }, 400);
        }

        logger.info("Received data for IBS predictability analysis");
        const prediction = await predictIBSOutcome(requestData.fhirData, requestData.qolResponses);

        logger.info("Returning IBS predictability AI result");
        return c.json(prediction, 200);
    } catch (error) {
        logger.error({ error }, "Error processing IBS predictability AI analysis");
        return c.json({ error: "Internal Server Error" }, 500);
    }
});
