import { AUTH_STRATEGY } from "../config.js";
import logger from "./logger.js";
import { authenticate as basicAuth } from "./basic-auth.js";
import { authenticate as cognitoAuth } from "./cognito.js";

/**
 * Chooses the correct authentication strategy based on AUTH_STRATEGY env var.
 * Supports:
 *   - Basic Auth  → used for local dev, tests (Hurl, CI)
 *   - Cognito     → used for production or EC2 deployment
 *
 * Default: Basic Auth
 */
export function authenticate() {
  const strategy = (AUTH_STRATEGY || "basic").toLowerCase();

  if (strategy === "cognito") {
    logger.info("[Auth] Using Cognito authentication strategy");
    return cognitoAuth();
  }

    logger.info("[Auth] Using Basic authentication strategy");
    return basicAuth();
}