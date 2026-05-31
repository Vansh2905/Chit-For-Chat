const INVALID_IMAGE_URL_MESSAGE =
  "Image URL must be a valid HTTPS Cloudinary image hosted for this application";

/**
 * Returns true only for HTTPS Cloudinary delivery URLs belonging to this account.
 * @param {string} url
 * @returns {boolean}
 */
export const isAllowedImageUrl = (url) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloudName || typeof url !== "string") {
    return false;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") {
    return false;
  }

  if (parsed.hostname !== "res.cloudinary.com") {
    return false;
  }

  const expectedPrefix = `/${cloudName}/`;
  const { pathname } = parsed;

  if (!pathname.startsWith(expectedPrefix) || pathname.length <= expectedPrefix.length) {
    return false;
  }

  return true;
};

export { INVALID_IMAGE_URL_MESSAGE };
