/**
 * Client helper: POST document upload to the consultant documents API route.
 * Validation (type, size) is done client-side before calling; the route re-validates.
 */

import type { StudentDocumentListItem } from "@app/graphql/types";

export interface UploadDocumentParams {
  file: File;
  studentId: string;
  documentType: string;
  applicationId?: string;
  loanApplicationId?: string;
}

export async function uploadDocument(
  params: UploadDocumentParams,
  token: string | null
): Promise<StudentDocumentListItem> {
  console.log("[upload] Starting document upload", {
    studentId: params.studentId,
    documentType: params.documentType,
    fileName: params.file.name,
    fileSize: params.file.size,
  });

  if (!token) {
    console.error("[upload] No auth token");
    throw new Error("Unauthorized");
  }

  const formData = new FormData();
  formData.append("studentId", params.studentId);
  formData.append("documentType", params.documentType);
  formData.append("file", params.file);
  if (params.applicationId) {
    formData.append("applicationId", params.applicationId);
  }
  if (params.loanApplicationId) {
    formData.append("loanApplicationId", params.loanApplicationId);
  }

  const res = await fetch("/api/consultant/documents/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Upload failed";
    console.error("[upload] Upload failed", { status: res.status, message, data });
    throw new Error(message);
  }

  const result = data as StudentDocumentListItem;
  console.log("[upload] Upload success", { id: result?.id, documentType: result?.documentType });
  return result;
}
