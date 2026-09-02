import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { s3 } from "@/lib/aws/s3";
import { prisma } from "@/lib/db/prisma";
import { mediaSubmissionSchema } from "@/lib/validations/media-submission";

const bucketName = process.env.S3_MEDIA_BUCKET;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    if (!bucketName) {
      return NextResponse.json(
        { error: "Media storage is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const parsed = mediaSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid media submission",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      registrationId,
      objectKey,
      contentType,
      caption,
    } = parsed.data;

    const registration =
      await prisma.eventRegistration.findUnique({
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

    const expectedPrefix =
      `pending/${registration.event.id}/` +
      `${registration.id}/`;

    if (!objectKey.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Invalid media object" },
        { status: 403 }
      );
    }

    const object = await s3.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    if (
      object.Metadata?.registrationid !== registration.id ||
      object.Metadata?.eventid !== registration.event.id
    ) {
      return NextResponse.json(
        { error: "Media metadata does not match registration" },
        { status: 403 }
      );
    }

    if (object.ContentType !== contentType) {
      return NextResponse.json(
        { error: "Uploaded media type does not match request" },
        { status: 400 }
      );
    }

    const size = object.ContentLength ?? 0;

    const isImage = contentType.startsWith("image/");
    const maxSize = isImage
      ? MAX_IMAGE_SIZE
      : MAX_VIDEO_SIZE;

    if (size <= 0 || size > maxSize) {
      return NextResponse.json(
        { error: "Uploaded media exceeds allowed size" },
        { status: 400 }
      );
    }

    const submission = await prisma.mediaSubmission.create({
      data: {
        eventId: registration.event.id,
        contactId: registration.contactId,
        fileKey: objectKey,
        fileType: isImage ? "IMAGE" : "VIDEO",
        caption: caption || null,
      },
    });

    return NextResponse.json(
      {
        message: "Media submission recorded",
        submissionId: submission.id,
        status: submission.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Media submission error:", error);

    return NextResponse.json(
      { error: "Unable to complete media submission" },
      { status: 500 }
    );
  }
}