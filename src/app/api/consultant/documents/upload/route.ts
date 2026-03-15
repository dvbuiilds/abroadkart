import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  ALLOWED_MIME,
  getMaxSizeForDocumentType,
} from "@app/lib/documents/constants";

const KEYSTONE_URL =
  process.env.NEXT_PUBLIC_KEYSTONE_URL || "http://localhost:3001";

const CREATE_STUDENT_DOCUMENT_MUTATION = `mutation CreateStudentDocument($data: StudentDocumentCreateInput!) { createStudentDocument(data: $data) { id documentType verificationStatus uploadedAt student { id fullName } } }`;

export async function POST(req: NextRequest) {
  console.log("[upload route] POST /api/consultant/documents/upload received");
  try {
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) {
      console.warn("[upload route] No Clerk token");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("[upload route] Auth OK (token present)");

    const formData = await req.formData();
    const studentId = formData.get("studentId");
    const documentType = formData.get("documentType");
    const file = formData.get("file");
    const applicationId = formData.get("applicationId");
    const loanApplicationId = formData.get("loanApplicationId");

    if (
      typeof studentId !== "string" ||
      !studentId ||
      typeof documentType !== "string" ||
      !documentType
    ) {
      console.warn("[upload route] Missing studentId or documentType", {
        hasStudentId: !!studentId,
        hasDocumentType: !!documentType,
      });
      return NextResponse.json(
        { error: "Missing studentId or documentType" },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File)) {
      console.warn("[upload route] No file or not a File instance");
      return NextResponse.json(
        { error: "Select a PDF file" },
        { status: 400 }
      );
    }

    if (file.type !== ALLOWED_MIME) {
      console.warn("[upload route] Invalid file type", { type: file.type });
      return NextResponse.json(
        { error: "Only PDF is allowed" },
        { status: 400 }
      );
    }

    const maxBytes = getMaxSizeForDocumentType(documentType);
    if (file.size > maxBytes) {
      console.warn("[upload route] File over size limit", {
        documentType,
        size: file.size,
        maxBytes,
      });
      const limit =
        documentType === "bankStatement" ? "1 MB" : "100 KB";
      return NextResponse.json(
        { error: `File must be under ${limit}` },
        { status: 400 }
      );
    }
    console.log("[upload route] Validation passed", {
      studentId,
      documentType,
      fileSize: file.size,
    });

    const dataPayload: {
      student: { connect: { id: string } };
      documentType: string;
      file: { upload: null };
      application?: { connect: { id: string } };
      loanApplication?: { connect: { id: string } };
    } = {
      student: { connect: { id: studentId } },
      documentType,
      file: { upload: null },
    };
    if (typeof applicationId === "string" && applicationId) {
      dataPayload.application = { connect: { id: applicationId } };
    }
    if (typeof loanApplicationId === "string" && loanApplicationId) {
      dataPayload.loanApplication = { connect: { id: loanApplicationId } };
    }
    const operations = JSON.stringify({
      query: CREATE_STUDENT_DOCUMENT_MUTATION,
      variables: { data: dataPayload },
    });
    const map = JSON.stringify({ "0": ["variables.data.file.upload"] });

    const multipart = new FormData();
    multipart.append("operations", operations);
    multipart.append("map", map);
    multipart.append("0", file);

    const target = new URL("/api/graphql", KEYSTONE_URL);
    console.log("[upload route] Forwarding to Keystone", {
      target: target.toString(),
    });
    const upstream = await fetch(target.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "apollo-require-preflight": "1",
      },
      body: multipart,
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      console.error("[upload route] Keystone responded with error", {
        status: upstream.status,
        statusText: upstream.statusText,
        bodyPreview: text.slice(0, 500),
      });
      return NextResponse.json(
        { error: "Upload failed" },
        { status: upstream.status }
      );
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (parseErr) {
      console.error("[upload route] Keystone response not JSON", {
        bodyPreview: text.slice(0, 500),
        parseError: parseErr,
      });
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 502 }
      );
    }

    const data = json as { errors?: unknown[]; data?: { createStudentDocument?: unknown } };
    if (data.errors?.length) {
      const msg =
        (data.errors[0] as { message?: string })?.message ?? "Upload failed";
      console.warn("[upload route] GraphQL errors from Keystone", {
        errors: data.errors,
      });
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    console.log("[upload route] Upload success", {
      docId: (data.data?.createStudentDocument as { id?: string })?.id,
    });
    return NextResponse.json(data.data?.createStudentDocument ?? {});
  } catch (err) {
    console.error("[upload route] Unexpected error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
