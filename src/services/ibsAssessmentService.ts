// src/services/ibsAssessmentService.ts
import { config } from "../../config";
import { IBSAssessment, ProcessedFHIRData } from "../types/ibs";
import { OpenAIResponse } from '../types/openai';
import { getDefaultAssessment } from "../utils/defaultAssessments";
import logger from "../utils/logger";
import { TimeoutError, timeoutPromise } from "../utils/timeout";


// Example: A typed function for evidence-based IBS assessment
export async function evidenceBasedIBSAssessment(
  fhirData: ProcessedFHIRData
): Promise<IBSAssessment> {
  logger.info({fhirData},"Starting IBS assessment with ROME IV criteria (comprehensive)");

  // Build messages
  const messages = [
    {
      role: "system",
      content: `${config.sysContent}`
    },
    {
      role: "user",
      content: `${config.userContent} ${JSON.stringify(fhirData, null, 2)}`
    }
  ];
  logger.info({messages}, "Prompt message for Comprehesive Assessment" )
  // Construct the request body
  const requestBody = {
    model: config.openAiModel,
    messages,
    // Use max_completion_tokens instead of max_tokens
    max_completion_tokens: config.defaultMaxTokens,
    temperature: config.defaultTemperature,
    // We can enforce valid JSON output
    response_format: { type: "json_object" },
    store: true,
    // Add metadata for future reference or analytics
    metadata: {
      patient_id: fhirData.patient.id,
      reason: "IBS_ComprehensiveAnalysis",
    },
  };

  try {
    const response = await timeoutPromise(
      fetch(`${config.openAIAPIURL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.openAiApiKey}`,
        },
        body: JSON.stringify(requestBody),
      }),
      config.apiTimeout
    );

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    // Log x-request-id for easier debugging
    const requestId = response.headers.get("x-request-id");
    if (requestId) {
      logger.info(`OpenAI x-request-id: ${requestId}`);
    }

    const data = (await response.json()) as OpenAIResponse;
    const rawContent = data.choices[0]?.message?.content;

    let assessment: IBSAssessment;
    try {
      assessment = JSON.parse(rawContent);
    } catch (parseError) {
      logger.warn({ parseError, rawContent }, "Failed to parse IBSAssessment JSON");
      return getDefaultAssessment();
    }

    logger.info({ assessment }, "Completed IBS assessment");
    return assessment;
  } catch (error) {
    if (error instanceof TimeoutError) {
      logger.error({ error }, "OpenAI request timed out");
      return getDefaultAssessment();
    }
    const errObj = error as Error;
    logger.error(
        { message: errObj.message, stack: errObj.stack },
        "Error in short IBS assessment"
    );
    return getDefaultAssessment();
  }
}
