import { storage } from "../utils/firebase";
import { PDFDocument } from "pdf-lib";

/**
 * **Save Images as a PDF and Upload to Firebase Storage**
 *
 * This function takes an array of **base64-encoded images**, converts them into a **PDF document**,
 * and uploads the PDF to Firebase Storage. The **public URL** of the saved PDF is returned.
 *
 * **Key Operations:**
 * 1. **Validate Input:**
 *    - Ensures `base64Images` is a non-empty array.
 *
 * 2. **Convert Images to Buffer:**
 *    - Decodes each **Base64 string** into a binary buffer.
 *
 * 3. **Create a PDF Document:**
 *    - Uses `PDFDocument.create()` to generate a new **PDF file**.
 *    - Embeds **each image as a separate page**.
 *
 * 4. **Upload PDF to Firebase Storage:**
 *    - Defines a unique storage path:
 *      - `Shop-Documents/{path}/{name}_{timestamp}.pdf`
 *    - Uploads the PDF with **MIME type** `"application/pdf"`.
 *    - Sets the PDF to **publicly accessible**.
 *
 * 5. **Return the Public URL:**
 *    - The function returns a **publicly accessible URL** of the uploaded PDF.
 *
 * **Firestore Storage Used:**
 * - **Bucket:** `"informal-traders-africa"`
 * - **Path Structure:**
 *   ```txt
 *   Shop-Documents/{path}/{name}_{timestamp}.pdf
 *   ```
 *
 * **Expected Parameters:**
 * ```json
 * {
 *   "base64Images": ["<base64_string>", "<base64_string>"],
 *   "path": "shop123",
 *   "name": "TradingLicense"
 * }
 * ```
 *
 * **Response Example:**
 * ```json
 * "https://storage.googleapis.com/informal-traders-africa/Shop-Documents/shop123/TradingLicense_1712928000000.pdf"
 * ```
 *
 * **Possible Errors:**
 * - `"Invalid input. No images provided."`: If the input array is empty or invalid.
 * - `"unknown"`: If an unexpected error occurs during the PDF generation or upload.
 *
 * @param {string[]} base64Images - Array of base64-encoded images to be converted into a PDF.
 * @param {string} path - The storage directory where the PDF should be saved.
 * @param {string} name - A unique identifier for the PDF file.
 * @returns {Promise<string>} The public URL of the uploaded PDF.
 * @throws {Error} If the input is invalid or an upload error occurs.
 */

export async function savePDFs(
  base64Images: string[],
  path: string,
  name: string,
  root: string = "Shop-Documents"
): Promise<string> {
  if (
    !base64Images ||
    !Array.isArray(base64Images) ||
    base64Images.length === 0
  ) {
    throw new Error("Invalid input. No images provided.");
  }
  // Convert base64 images to buffer
  const imageBuffers = base64Images.map((base64Image) =>
    Buffer.from(base64Image, "base64")
  );

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  for (const imageBuffer of imageBuffers) {
    const image = await pdfDoc.embedJpg(imageBuffer);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  const pdfBytes = await pdfDoc.save();
  // Define the PDF file path and name in Firebase Storage
  const pdfFileName = `${root}/${path}/${name}_${Date.now()}.pdf`;
  const pdfFile = storage.bucket().file(pdfFileName);
  // Save the PDF to Firebase Storage
  await pdfFile.save(Buffer.from(pdfBytes), {
    contentType: "application/pdf",
  });
  await pdfFile.makePublic();
  return pdfFile.publicUrl();
}
