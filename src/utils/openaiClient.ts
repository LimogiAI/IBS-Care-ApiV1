import logger from "./logger";

// src/utils/openaiClient.ts
export interface IBSRiskResult {
    riskScore: number;
    recommendations: string[];
}

/**
 * Given a FHIR bundle (or patient data object), this function builds a prompt,
 * calls the OpenAI API (GPT-3.5-turbo), and returns an object with the IBS risk score
 * and recommendations.
 */
export async function predictIBSRisk(fhirData: any): Promise<IBSRiskResult> {
    logger.info({ fhirData }, "Check Point: INSIDE THE predictIBSRisk function");

    const prompt = `
You are a clinical decision support assistant.
Given the following FHIR patient data, evaluate the risk for Irritable Bowel Syndrome (IBS).
Provide a risk score between 0 and 100 along with guideline-based recommendations if the risk is high.
Output the result in JSON format with the keys "riskScore" and "recommendations". For example:
{
  "riskScore": 75,
  "recommendations": [
    "Order additional lab tests (e.g., celiac panel, inflammatory markers)",
    "Refer to gastroenterology",
    "Suggest a dietary assessment"
  ]
}

FHIR Patient Data:
${JSON.stringify(fhirData, null, 2)}
`;

    // Make sure your environment variable OPENAI_API_KEY is set.
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        logger.error({}, "OPENAI_API_KEY is not set in environment variables.");
        throw new Error("OPENAI_API_KEY is not set in environment variables.");
    }

    logger.info({}, "Check Point: INSIDE THE OpenAI - PRE OpenAI Invoke");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
            temperature: 0.7,
        }),
    });

    logger.info({ status: response.status, headers: response.headers }, "Check Point: INSIDE THE OpenAI - POST OpenAI Invoke");

    if (!response.ok) {
        const errorDetails = await response.text();
        logger.error({ errorDetails, status: response.status }, "OpenAI API error occurred");
        throw new Error(`OpenAI API error: ${errorDetails}`);
    }

    logger.info({}, "Check Point: INSIDE THE OpenAI - Pre conversion to JSON");

    const data = await response.json();
    logger.info({ data }, "Check Point: INSIDE THE OpenAI - POST conversion to JSON");

    // OpenAI returns an array of choices; we use the first one.
    const content = data.choices[0].message.content;
    try {
        const result: IBSRiskResult = JSON.parse(content);
        logger.info({ result }, "Successfully parsed OpenAI API response");
        return result;
    } catch (error) {
        logger.error({ content, error }, "Failed to parse OpenAI API response");
        throw new Error("Failed to parse OpenAI API response: " + content);
    }
}

