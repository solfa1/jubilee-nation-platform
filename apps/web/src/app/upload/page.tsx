import { RegistrationLookupForm } from "@/components/media/registration-lookup-form";

export default function UploadEntryPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
      <div className="w-full">
        <h1 className="text-3xl font-semibold">
          Upload your media
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Already registered for Festival of Glory? Enter the same
          phone number you used during registration.
        </p>

        <div className="mt-8">
          <RegistrationLookupForm
            eventSlug="festival-of-glory-2026"
          />
        </div>
      </div>
    </main>
  );
}