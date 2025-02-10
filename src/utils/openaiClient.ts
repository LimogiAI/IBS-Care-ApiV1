// src/utils/openaiClient.ts
import logger from "./logger";
import { IBSAssessment } from '../types/ibs';

const OPENAI_MODEL = "gpt-3.5-turbo-0125";
const DEFAULT_MAX_TOKENS = 1000;
const DEFAULT_TEMPERATURE = 0.1;
const API_TIMEOUT = 10000;
const MAX_RETRIES = 2;

// Custom error class for timeout
class TimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TimeoutError';
    }
}

// Timeout wrapper function
function timeoutPromise<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            setTimeout(() => {
                reject(new TimeoutError(`Request timed out after ${timeout}ms`));
            }, timeout);
        })
    ]);
}

// Default assessment for fallback
const getDefaultAssessment = (): IBSAssessment => ({
    romeIVCriteriaMet: false,
    ibsSSS: {
        abdominalPainSeverity: 0,
        abdominalPainFrequency: 0,
        bloatingSeverity: 0,
        bowelHabitDissatisfaction: 0,
        lifeInterference: 0,
        totalScore: 0
    },
    recommendations: [
        "Unable to complete IBS assessment at this time.",
        "Please try again later."
    ]
});

async function callOpenAI(prompt: string, retryCount = 0): Promise<IBSAssessment> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set");
    }

    try {
        const response = await timeoutPromise(
            fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: OPENAI_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: DEFAULT_TEMPERATURE,
                    max_tokens: DEFAULT_MAX_TOKENS,
                    response_format: { type: "json_object" }
                }),
            }),
            API_TIMEOUT
        );

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${await response.text()}`);
        }

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);

    } catch (error) {
        if (error instanceof TimeoutError) {
            logger.error({ error }, "OpenAI API timeout");
            throw error;
        }

        if (retryCount < MAX_RETRIES) {
            logger.warn({ error, retryCount }, "Retrying OpenAI API call");
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return callOpenAI(prompt, retryCount + 1);
        }

        throw error;
    }
}

export async function predictIBSRisk(fhirData: any): Promise<IBSAssessment> {
    try {
        logger.info("Starting IBS assessment with ROME IV criteria");

        const prompt = `You are a gastroenterology clinical decision support system.

Analyze the provided FHIR resources and evaluate for IBS using ROME IV criteria and IBS-SSS scoring system.

ROME IV Diagnostic Criteria for IBS:
- Recurrent abdominal pain at least 1 day/week in the last 3 months, associated with 2+ of:
  1. Related to defecation
  2. Associated with change in stool frequency
  3. Associated with change in stool form/appearance

IBS Severity Scoring System (IBS-SSS) components (each 0-100):
1. Abdominal pain severity
2. Abdominal pain frequency
3. Bloating severity
4. Bowel habit dissatisfaction
5. Life interference

Severity Classification:
- Mild: <175
- Moderate: 175-300
- Severe: >300

Bristol Stool Scale for IBS Subtyping:
- IBS-C: >25% Type 1-2, <25% Type 6-7
- IBS-D: <25% Type 1-2, >25% Type 6-7
- IBS-M: >25% Type 1-2, >25% Type 6-7
- IBS-U: Insufficient abnormal stools to meet other subtypes

FHIR Resources:
${JSON.stringify(fhirData, null, 2)}

Provide assessment in this JSON format:
{
    "romeIVCriteriaMet": boolean,
    "ibsSSS": {
        "abdominalPainSeverity": number,
        "abdominalPainFrequency": number,
        "bloatingSeverity": number,
        "bowelHabitDissatisfaction": number,
        "lifeInterference": number,
        "totalScore": number
    },
    "bristolStoolScale": number,
    "ibsSubtype": "IBS-C" | "IBS-D" | "IBS-M" | "IBS-U",
    "recommendations": string[],
    "suggestedLabTests": string[]
}`;

        try {
            const result = await callOpenAI(prompt);

            // Validate scores are within range
            result.ibsSSS.totalScore = Object.values(result.ibsSSS)
                .filter(val => typeof val === 'number' && val <= 100)
                .reduce((sum, val) => sum + val, 0);

            logger.info({ result }, "Completed IBS assessment");
            return result;

        } catch (error) {
            if (error instanceof TimeoutError) {
                logger.error({ error }, "OpenAI request timed out");
                return {
                    ...getDefaultAssessment(),
                    recommendations: [
                        "Unable to complete IBS assessment due to system timeout.",
                        "Please try again in a few minutes"
                    ]
                };
            }

            throw error;
        }

    } catch (error) {
        logger.error({ error }, "Error in IBS assessment");
        return getDefaultAssessment();
    }
}