import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const eventSlug =
      typeof body.eventSlug === "string"
        ? body.eventSlug.trim()
        : "";

    if (!phone || !eventSlug) {
      return NextResponse.json(
        { error: "Phone number and event are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: {
        slug: eventSlug,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "This event is not currently available" },
        { status: 409 }
      );
    }

    const contact = await prisma.contact.findFirst({
      where: {
        phone,
      },
      select: {
        id: true,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "No registration found for this phone number" },
        { status: 404 }
      );
    }

    const registration =
      await prisma.eventRegistration.findUnique({
        where: {
          eventId_contactId: {
            eventId: event.id,
            contactId: contact.id,
          },
        },
        select: {
          id: true,
        },
      });

    if (!registration) {
      return NextResponse.json(
        { error: "No registration found for this event" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      registrationId: registration.id,
    });
  } catch (error) {
    console.error("Registration lookup error:", error);

    return NextResponse.json(
      { error: "Unable to find registration" },
      { status: 500 }
    );
  }
}