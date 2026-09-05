import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

type DashboardPageProps = {
  params: Promise<{
    registrationId: string;
  }>;
};

export default async function DashboardPage({
  params,
}: DashboardPageProps) {
  const { registrationId } = await params;

  const registration =
    await prisma.eventRegistration.findUnique({
      where: {
        id: registrationId,
      },
      include: {
        event: {
          select: {
            name: true,
            slug: true,
          },
        },
        contact: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

  if (!registration) {
    notFound();
  }

  const [
    mediaSubmissionCount,
    testimonyCount,
  ] = await Promise.all([
    prisma.mediaSubmission.count({
      where: {
        eventId: registration.eventId,
        contactId: registration.contactId,
      },
    }),

    prisma.testimony.count({
      where: {
        eventId: registration.eventId,
        contactId: registration.contactId,
      },
    }),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground">
          {registration.event.name}
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          Welcome, {registration.contact.firstName}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Share your media, submit a testimony, or return later
          to contribute more.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>

            <CardDescription>
              Share photos and videos from the programme.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {mediaSubmissionCount} submission
              {mediaSubmissionCount === 1 ? "" : "s"}
            </p>

            <Button asChild className="w-full">
              <Link href={`/upload/${registrationId}`}>
                Upload media
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testimony</CardTitle>

            <CardDescription>
              Share what God did for you during the programme.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {testimonyCount} testimon
              {testimonyCount === 1 ? "y" : "ies"}
            </p>

            <Button asChild className="w-full">
              <Link href={`/testimony/${registrationId}`}>
                Share testimony
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}