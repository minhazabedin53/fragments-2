import passport from "passport";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import authorize from "./auth-middleware.js";
import logger from "../logger.js";
import { AWS_REGION, COGNITO_POOL_ID } from "../config.js";

// Read from config (dotenv already loaded there)
const REGION = AWS_REGION;
const USER_POOL_ID = COGNITO_POOL_ID;

const ISSUER =
  REGION && USER_POOL_ID
    ? `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`
    : null;

let client = null;

if (ISSUER) {
  client = jwksClient({
    jwksUri: `${ISSUER}/.well-known/jwks.json`,
  });
  logger.info(
    { issuer: ISSUER },
    "Cognito issuer configured, JWKS client initialized",
  );
} else {
  logger.warn(
    "Cognito issuer not configured (check AWS_REGION and COGNITO_POOL_ID)",
  );
}

// Helper for JWT verification: get signing key dynamically
function getKey(header, callback) {
  if (!client) {
    return callback(new Error("JWKS client not configured"));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    try {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    } catch (e) {
      callback(e);
    }
  });
}

// Configure Bearer strategy for Cognito access tokens
passport.use(
  new BearerStrategy((token, done) => {
    if (!ISSUER) {
      logger.warn("Bearer auth used but ISSUER not configured");
      return done(null, false);
    }

    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: ISSUER,
        // Optionally enforce app client:
        // audience: COGNITO_APP_CLIENT_ID,
      },
      (err, decoded) => {
        if (err || !decoded) {
          logger.warn({ err }, "JWT verification failed");
          return done(null, false);
        }

        const email =
          decoded.email ||
          decoded.username ||
          decoded["cognito:username"] ||
          decoded.sub;

        if (!email) {
          logger.warn(
            { decoded },
            "Cognito token missing email/username/sub; cannot derive ownerId",
          );
          return done(null, false);
        }

        logger.debug({ email }, "Cognito token accepted");
        return done(null, { email });
      },
    );
  }),
);

// Export authenticate() using our generic wrapper
export const authenticate = () => authorize("bearer");
