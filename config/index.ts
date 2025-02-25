// src/config/index.ts
import logger from "../src/utils/logger";

export interface AppConfig {
  nodeEnv: string;
  port: number;
  ehrLaunchAppBaseUrl: string;
  //AI
  openAIAPIURL: string;
  openAiApiKey: string;
  openAiModel: string;
  defaultMaxTokens: number;
  defaultTemperature: number;
  apiTimeout: number;
  // Prompt messages
  sysContent: string;
  userContent: string;
  userContent3: string;
  cdsHookSysContent: string;
  cdsHookUserContent: string;
  sysContentPredictability: string;
  userContentPredictability: string;
}

function loadEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    logger.error(`Missing environment variable: ${key}`);
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4433),
  ehrLaunchAppBaseUrl: process.env.EHR_LAUNCH_APP_BASE_URL || 'http://localhost:4434',


  openAIAPIURL: process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
  openAiApiKey: loadEnv('OPENAI_API_KEY'),
  openAiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo-0125',
  defaultMaxTokens: Number(process.env.DEFAULT_MAX_TOKENS) || 1000,
  defaultTemperature: Number(process.env.DEFAULT_TEMPERATURE) || 0.1,
  apiTimeout: Number(process.env.API_TIMEOUT) || 10000,

  sysContent: process.env.SYS_CONTENT || '',
  userContent: process.env.USER_CONTENT || '',
  userContent3: process.env.USER_CONTENT3 || '',

  cdsHookSysContent: process.env.CDS_HOOK_SYS_CONTENT || '',
  cdsHookUserContent: process.env.CDS_HOOK_USER_CONTENT || '',
  // cdsHookUserContent3: process.env.CDS_HOOK_USER_CONTENT3 || '',

  sysContentPredictability: process.env.SYS_CONTENT_PREDICTABILITY || '',
  userContentPredictability: process.env.USER_CONTENT_PREDICTABILITY || '',
  // ...
};
