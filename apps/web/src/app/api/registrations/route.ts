import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { registrationSchema } from "@/lib/validations/registration";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid registration data",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const event = await prisma.event.findUnique({
      where: {
        slug: data.eventSlug,
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
        { error: "Registration is not available for this event" },
        { status: 409 }
      );
    }

    const normalizedPhone = data.phone.trim();

    const result = await prisma.$transaction(async (tx) => {
      let contact = await tx.contact.findFirst({
        where: {
          phone: normalizedPhone,
        },
      });

      if (!contact) {
        contact = await tx.contact.create({
          data: {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phone: normalizedPhone,
            email: data.email || null,
            instagramHandle: data.instagramHandle || null,
            twitterHandle: data.twitterHandle || null,
            facebookHandle: data.facebookHandle || null,
            tiktokHandle: data.tiktokHandle || null,
            location: data.location || null,
          },
        });
      }

      const registration = await tx.eventRegistration.upsert({
        where: {
          eventId_contactId: {
            eventId: event.id,
            contactId: contact.id,
          },
        },
        update: {
          firstTimeVisitor: data.firstTimeVisitor,
          consentFollowUp: data.consentFollowUp,
          consentMedia: data.consentMedia,
          consentTestimony: data.consentTestimony,
        },
        create: {
          eventId: event.id,
          contactId: contact.id,
          firstTimeVisitor: data.firstTimeVisitor,
          consentFollowUp: data.consentFollowUp,
          consentMedia: data.consentMedia,
          consentTestimony: data.consentTestimony,
        },
      });

      return { contact, registration };
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        registrationId: result.registration.id,
        contactId: result.contact.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Unable to complete registration" },
      { status: 500 }
    );
  }
}