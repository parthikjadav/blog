import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

/**
 * Authenticate request with x-api-key header
 */
function authenticate(req: Request): boolean {
  const apiKey = req.headers.get("x-api-key");
  return apiKey === process.env.POSTS_UPLOAD_API_KEY;
}

/**
 * Allowed image MIME types
 */
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

/**
 * Max file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  return map[mimeType] || "jpg";
}

/**
 * Sanitize filename to prevent path traversal and invalid characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/**
 * POST /api/admin/image/upload
 *
 * Upload an image to public/images folder
 *
 * Headers:
 * - x-api-key: Required API key for authentication
 * - Content-Type: multipart/form-data
 *
 * Form Data:
 * - image: Image file (required)
 * - name: Optional custom name (without extension)
 *
 * Returns:
 * - 200: { success, url, filename, size }
 * - 400: Invalid file type, size, or missing file
 * - 401: Unauthorized
 * - 500: Server error
 */
export async function POST(req: Request) {
  // Authenticate
  if (!authenticate(req)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Invalid or missing x-api-key header",
      },
      { status: 401 }
    );
  }

  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const customName = formData.get("name") as string | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        {
          error: "Bad request",
          message: "No image file provided. Use 'image' field in form data.",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          message: `Only ${ALLOWED_TYPES.join(", ")} are allowed`,
          receivedType: file.type,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File too large",
          message: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          receivedSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    // Determine filename
    const extension = getExtensionFromMimeType(file.type);
    let filename: string;

    if (customName) {
      // Use custom name (sanitized) + extension
      const sanitized = sanitizeFilename(customName);
      if (!sanitized) {
        return NextResponse.json(
          {
            error: "Invalid name",
            message: "Provided name contains only invalid characters",
          },
          { status: 400 }
        );
      }
      filename = `${sanitized}.${extension}`;
    } else {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      filename = `image-${timestamp}-${randomStr}.${extension}`;
    }

    // Ensure public/images directory exists
    const imagesDir = path.join(process.cwd(), "public", "images");
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }

    // Check if file already exists (if custom name provided)
    const filepath = path.join(imagesDir, filename);
    if (customName && existsSync(filepath)) {
      return NextResponse.json(
        {
          error: "File exists",
          message: `An image with name "${filename}" already exists`,
          suggestion: "Use a different name or omit the name parameter",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      url: `/images/${filename}`,
      filename,
      size: file.size,
      sizeFormatted: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type,
    });
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Failed to upload image",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/image/upload
 *
 * Get upload endpoint information
 */
export async function GET(req: Request) {
  // Authenticate
  if (!authenticate(req)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Invalid or missing x-api-key header",
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    endpoint: "/api/admin/image/upload",
    method: "POST",
    contentType: "multipart/form-data",
    fields: {
      image: {
        type: "file",
        required: true,
        description: "Image file to upload",
      },
      name: {
        type: "string",
        required: false,
        description: "Optional custom filename (without extension)",
      },
    },
    allowedTypes: ALLOWED_TYPES,
    maxSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    authentication: "x-api-key header required",
  });
}

/**
 * Handle other HTTP methods
 */
export async function PUT() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "Only POST and GET requests are accepted",
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "Only POST and GET requests are accepted",
    },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "Only POST and GET requests are accepted",
    },
    { status: 405 }
  );
}
