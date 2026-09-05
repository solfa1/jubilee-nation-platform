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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

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

  const [mediaSubmissions, testimonies] =
    await Promise.all([
      prisma.mediaSubmission.findMany({
        where: {
          eventId: registration.eventId,
          contactId: registration.contactId,
        },
        select: {
          id: true,
          fileType: true,
          caption: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.testimony.findMany({
        where: {
          eventId: registration.eventId,
          contactId: registration.contactId,
        },
        select: {
          id: true,
          title: true,
          status: true,
          verified: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
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
          Share your media, submit a testimony, and review
          your previous submissions.
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

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {mediaSubmissions.length} submission
                {mediaSubmissions.length === 1 ? "" : "s"}
              </p>

              <Button asChild>
                <Link href={`/upload/${registrationId}`}>
                  Upload media
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-medium">
                My media submissions
              </h2>

              {mediaSubmissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have not submitted any media yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {mediaSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {submission.fileType === "IMAGE"
                              ? "Photo"
                              : "Video"}
                          </p>

                          {submission.caption && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {submission.caption}
                            </p>
                          )}
                        </div>

                        <span className="text-xs font-medium">
                          {submission.status}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-muted-foreground">
                        {formatDate(submission.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testimonies</CardTitle>

            <CardDescription>
              Share what God did for you during the programme.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {testimonies.length}{" "}
                {testimonies.length === 1
                  ? "testimony"
                  : "testimonies"}
              </p>

              <Button asChild>
                <Link href={`/testimony/${registrationId}`}>
                  Share testimony
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-medium">
                My testimonies
              </h2>

              {testimonies.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have not submitted a testimony yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {testimonies.map((testimony) => (
                    <div
                      key={testimony.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {testimony.title}
                          </p>

                          {testimony.verified && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Verified
                            </p>
                          )}
                        </div>

                        <span className="text-xs font-medium">
                          {testimony.status}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-muted-foreground">
                        {formatDate(testimony.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}