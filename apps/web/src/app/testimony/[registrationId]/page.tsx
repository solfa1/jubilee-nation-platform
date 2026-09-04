import { TestimonyForm } from "@/components/testimony/testimony-form";

type TestimonyPageProps = {
  params: Promise<{
    registrationId: string;
  }>;
};

export default async function TestimonyPage({
  params,
}: TestimonyPageProps) {
  const { registrationId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-12">
      <div className="w-full">
        <h1 className="text-3xl font-semibold">
          Share your testimony
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Tell us what God did for you during Festival of Glory.
        </p>

        <div className="mt-8">
          <TestimonyForm
            registrationId={registrationId}
          />
        </div>
      </div>
    </main>
  );
}