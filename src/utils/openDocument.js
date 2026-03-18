// utils/openDocument.js
// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary URLs behave differently depending on resource_type:
//   - image (jpg/png)  → opens directly ✅
//   - image/pdf        → Cloudinary converts to jpg — need fl_attachment flag ✅
//   - raw (doc/docx)   → must use Google Docs viewer ✅
//   - video (mp4)      → opens directly ✅
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect file type from a Cloudinary URL or filename
 */
export const getFileType = (url = "") => {
  const lower = url.toLowerCase();

  // Cloudinary raw uploads contain /raw/upload/ in the URL
  if (lower.includes("/raw/upload/")) return "raw";

  // Video
  if (lower.includes("/video/upload/") || /\.(mp4|mov|webm|avi)(\?|$)/.test(lower)) return "video";

  // Check extension
  const ext = lower.split("?")[0].split(".").pop();
  if (["doc", "docx"].includes(ext)) return "raw";
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";

  // Cloudinary image upload that is actually a PDF (stored as image resource_type)
  // These usually have no extension or end in jpg after conversion
  if (lower.includes("/image/upload/")) {
    // If the original filename hint is in the URL path
    if (lower.includes(".pdf")) return "pdf";
    return "image";
  }

  return "unknown";
};

/**
 * Get the correct viewable URL for a given Cloudinary file URL
 */
export const getViewableUrl = (url = "") => {
  if (!url) return null;
  const type = getFileType(url);

  if (type === "raw") {
    // Google Docs viewer handles doc/docx/pdf perfectly
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`;
  }

  if (type === "pdf") {
    // For PDFs stored as Cloudinary image resource_type,
    // inject fl_attachment:false so the browser renders instead of downloading
    // Also append /fl_attachment:false before the filename
    const pdfUrl = url.replace("/image/upload/", "/image/upload/fl_attachment:false/");
    // Use Google Docs viewer as reliable fallback
    return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=false`;
  }

  // Images and videos open directly
  return url;
};

/**
 * Open a document in the best viewer
 */
export const openDocument = (url) => {
  const viewUrl = getViewableUrl(url);
  if (viewUrl) window.open(viewUrl, "_blank", "noopener,noreferrer");
};
