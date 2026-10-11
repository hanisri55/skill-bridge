import mammoth from "mammoth";

export async function parseResumeBuffer(buffer: Buffer, mimetype: string, filename: string): Promise<string> {
  const isPdf = mimetype === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
  const isDocx = mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || filename.toLowerCase().endsWith(".docx");

  try {
    if (isPdf) {
      const pdfParseModule: any = await import("pdf-parse");
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(buffer);
      return data.text || "";
    }

    if (isDocx) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    return buffer.toString("utf-8");
  } catch (error) {
    console.warn("[ResumeParser] Error extracting formatted file text, fallback to string extraction:", error);
    return buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r]/g, " ");
  }
}
