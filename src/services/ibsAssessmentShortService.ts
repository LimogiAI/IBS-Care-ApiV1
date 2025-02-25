// src/services/ibsAssessmentShortService.ts
import { config } from "../../config";
import { IBSAssessmentShort, ProcessedFHIRData } from "../types/ibs";
import { OpenAIResponse } from '../types/openai';
import { getDefaultAssessmentShort } from "../utils/defaultAssessmentsShort";

import logger from "../utils/logger";

import { TimeoutError, timeoutPromise } from "../utils/timeout";

export async function shortIBSAssessment(
    fhirData: ProcessedFHIRData
): Promise<IBSAssessmentShort> {
    logger.info("Starting short IBS assessment (ROME IV)...");

    const messages = [
        {
            role: "system",
            content: config.cdsHookSysContent
        },
        {
            role: "user",
            content: `${config.cdsHookUserContent} ${JSON.stringify(fhirData, null, 2)}`
        }
    ];

    logger.info({ messages }, "Message contents")

    // Build the request body
    const requestBody = {
        model: config.openAiModel,
        messages,
        max_completion_tokens: config.defaultMaxTokens,
        temperature: config.defaultTemperature,
        response_format: { type: "json_object" },
        store: true,
        // optional: add metadata
        metadata: {
            patient_id: fhirData.patient.id,
            reason: "IBS_ShortAnalysis"
        }
    };

    try {
        const response = await timeoutPromise(
            fetch(`${config.openAIAPIURL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.openAiApiKey}`
                },
                body: JSON.stringify(requestBody)
            }),
            config.apiTimeout
        );

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${await response.text()}`);
        }

        // Log x-request-id
        const requestId = response.headers.get("x-request-id");
        if (requestId) {
            logger.info(`OpenAI x-request-id: ${requestId}`);
        }

        const data = (await response.json()) as OpenAIResponse;
        const rawContent = data.choices[0]?.message?.content;

        let assessment: IBSAssessmentShort;
        try {
            assessment = JSON.parse(rawContent);
        } catch (parseError) {
            logger.warn({ parseError, rawContent }, "Failed to parse IBSAssessmentShort JSON");
            return getDefaultAssessmentShort();
        }

        logger.info({ assessment }, "Completed short IBS assessment");
        return assessment;
    } catch (error) {
        if (error instanceof TimeoutError) {
            logger.error({ error }, "OpenAI request timed out");
            return getDefaultAssessmentShort();
        }
        const errObj = error as Error;
        logger.error(
            { message: errObj.message, stack: errObj.stack },
            "Error in short IBS assessment"
        );
        return getDefaultAssessmentShort();
    }
}
