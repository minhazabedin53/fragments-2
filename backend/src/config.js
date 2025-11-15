// backend/src/config.js
import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const API_URL = process.env.API_URL || null;
export const LOG_LEVEL = process.env.LOG_LEVEL || "info";
export const AUTH_STRATEGY = (
  process.env.AUTH_STRATEGY || "basic"
).toLowerCase();
export const AWS_REGION = process.env.AWS_REGION;
export const COGNITO_POOL_ID = process.env.COGNITO_POOL_ID;
export const COGNITO_APP_CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;
