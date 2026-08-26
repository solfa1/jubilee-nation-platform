import { notFound } from "next/navigation";

import { RegistrationForm } from "@/components/registration/registration-form";
import { prisma } from "@/lib/db/prisma";

type RegistrationPageProps = {
  params: Promise<{
    eventSlug: string;
  }>;
};

export default async function RegistrationPage({
  params,
}: RegistrationPageProps) {
  const { eventSlug } = await params;

  const event = await prisma.event.findUnique({
    where: {
      slug: eventSlug,
    },
    select: {
      name: true,
      slug: true,
      description: true,
      status: true,
    },
  });

  if (!event || event.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Jubilee Nation
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {event.name}
          </h1>

          {event.description && (
            <p className="mt-3 text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>

        <RegistrationForm eventSlug={event.slug} />
      </div>
    </main>
  );
}