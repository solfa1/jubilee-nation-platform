import { MediaUploadForm } from "@/components/media/media-upload-form";

type UploadPageProps = {
  params: Promise<{
    registrationId: string;
  }>;
};

export default async function UploadPage({
  params,
}: UploadPageProps) {
  const { registrationId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-12">
      <div className="w-full">
        <h1 className="text-3xl font-semibold">
          Upload your media
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Share a photo or video from Festival of Glory.
        </p>

        <div className="mt-8">
          <MediaUploadForm registrationId={registrationId} />
        </div>
      </div>
    </main>
  );
}