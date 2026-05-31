import { OAuth2Client } from "google-auth-library";

const getClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID environment variable is not configured");
  }
  return new OAuth2Client(clientId);
};

/**
 * Verifies a Google ID token and returns trusted identity fields from the payload.
 * @param {string} idToken
 * @returns {Promise<{ email: string, name: string, picture: string | undefined, googleId: string }>}
 */
export const verifyGoogleIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("ID token is required");
  }

  const client = getClient();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload?.email) {
    throw new Error("Invalid Google token payload");
  }

  if (payload.email_verified === false) {
    throw new Error("Google email is not verified");
  }

  return {
    email: payload.email.toLowerCase(),
    name: (payload.name || payload.email.split("@")[0]).trim(),
    picture: payload.picture,
    googleId: payload.sub,
  };
};
