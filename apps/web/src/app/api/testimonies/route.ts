import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { testimonySubmissionSchema } from "@/lib/validations/testimony";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = testimonySubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid testimony submission",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      registrationId,
      title,
      content,
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
        {
          error: "Testimony submissions are closed for this event",
        },
        { status: 409 }
      );
    }

    const testimony = await prisma.testimony.create({
      data: {
        eventId: registration.event.id,
        contactId: registration.contactId,
        title,
        content,
      },
    });

    return NextResponse.json(
      {
        message: "Testimony submitted successfully",
        testimonyId: testimony.id,
        status: testimony.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Testimony submission error:", error);

    return NextResponse.json(
      { error: "Unable to submit testimony" },
      { status: 500 }
    );
  }
}