const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Upload an image through the authenticated backend (Cloudinary server-side).
 * @param {File} file
 * @param {string} token JWT bearer token
 * @returns {Promise<string>} imageUrl
 */
export const uploadImage = async (file, token) => {
  if (!token) {
    throw new Error("Authentication required to upload images");
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/api/upload/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Upload failed");
  }

  if (!data.imageUrl) {
    throw new Error("Upload failed: no image URL returned");
  }

  return data.imageUrl;
};
