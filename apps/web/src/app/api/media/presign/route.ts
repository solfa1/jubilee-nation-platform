import { randomUUID } from "crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

import { s3 } from "@/lib/aws/s3";
import { prisma } from "@/lib/db/prisma";
import { mediaPresignSchema } from "@/lib/validations/media";

const bucketName = process.env.S3_MEDIA_BUCKET;

function getExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension || extension === fileName.toLowerCase()) {
    return "";
  }

  return extension.replace(/[^a-z0-9]/g, "");
}

export async function POST(request: Request) {
  try {
    if (!bucketName) {
      console.error("S3_MEDIA_BUCKET is not configured");

      return NextResponse.json(
        { error: "Media storage is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const parsed = mediaPresignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid media upload request",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      registrationId,
      fileName,
      contentType,
      fileSize,
    } = parsed.data;

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        id: registrationId,
      },
      include: {
        event: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (registration.event.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Media submissions are closed for this event" },
        { status: 409 }
      );
    }

    const extension = getExtension(fileName);

    const objectName = extension
      ? `${randomUUID()}.${extension}`
      : randomUUID();

    const objectKey =
      `pending/${registration.event.id}/` +
      `${registration.id}/${objectName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
      Metadata: {
        registrationId: registration.id,
        eventId: registration.event.id,
      },
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
    });

    return NextResponse.json({
      uploadUrl,
      objectKey,
      expiresIn: 300,
      maxFileSize: fileSize,
    });
  } catch (error) {
    console.error("Presigned upload error:", error);

    return NextResponse.json(
      { error: "Unable to prepare media upload" },
      { status: 500 }
    );
  }
}