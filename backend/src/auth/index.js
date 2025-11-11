import { AUTH_STRATEGY } from "../config.js";
import * as basic from "./basic-auth.js";
import * as cognito from "./cognito.js";

export function authenticate() {
  if (AUTH_STRATEGY === "cognito") {
    return cognito.authenticate();
  }
  // default: basic auth
  return basic.authenticate();
}
