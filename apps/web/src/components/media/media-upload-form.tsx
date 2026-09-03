"use client";

import { FormEvent, useState } from "react";

type MediaUploadFormProps = {
  registrationId: string;
};

type PresignResponse = {
  uploadUrl: string;
  objectKey: string;
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

async function calculateFileHash(file: File) {
  const buffer = await file.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    buffer
  );

  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  );

  return hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function MediaUploadForm({
  registrationId,
}: MediaUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  function validateFile(selectedFile: File) {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      return "Unsupported file type.";
    }

    const isImage = selectedFile.type.startsWith("image/");
    const maxSize = isImage
      ? MAX_IMAGE_SIZE
      : MAX_VIDEO_SIZE;

    if (selectedFile.size > maxSize) {
      return isImage
        ? "Images must be 10 MB or smaller."
        : "Videos must be 100 MB or smaller.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setStatus("error");
      setMessage("Please select a file.");
      return;
    }

    const validationError = validateFile(file);

    if (validationError) {
      setStatus("error");
      setMessage(validationError);
      return;
    }

    try {
      setStatus("uploading");

      setMessage("Checking media...");

      const fileHash = await calculateFileHash(file);

      setMessage("Preparing upload...");

      const presignResponse = await fetch("/api/media/presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      const presignData =
        (await presignResponse.json()) as PresignResponse & {
          error?: string;
        };

      if (!presignResponse.ok) {
        throw new Error(
          presignData.error || "Unable to prepare upload."
        );
      }

      setMessage("Uploading media...");

      const uploadResponse = await fetch(
        presignData.uploadUrl,
        {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Unable to upload media.");
      }

      setMessage("Verifying upload...");

      const submissionResponse = await fetch(
        "/api/media/submissions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            registrationId,
            objectKey: presignData.objectKey,
            contentType: file.type,
            fileHash,
            caption: caption.trim() || undefined,
          }),
        }
      );

      const submissionData = await submissionResponse.json();

      if (!submissionResponse.ok) {
        throw new Error(
          submissionData.error ||
            "Unable to complete media submission."
        );
      }

      setStatus("success");
      setMessage("Your media was submitted successfully.");
      setFile(null);
      setCaption("");
    } catch (error) {
      console.error(error);

      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border p-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="media"
          className="text-sm font-medium"
        >
          Photo or video
        </label>

        <input
          id="media"
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
          disabled={status === "uploading"}
          onChange={(event) => {
            const selectedFile =
              event.target.files?.[0] ?? null;

            if (!selectedFile) {
              setFile(null);
              return;
            }

            const validationError =
              validateFile(selectedFile);

            if (validationError) {
              setFile(null);
              setStatus("error");
              setMessage(validationError);
              event.target.value = "";
              return;
            }

            setFile(selectedFile);
            setStatus("idle");
            setMessage("");
          }}
          className="block w-full text-sm"
        />

        <p className="text-xs text-muted-foreground">
          Images: maximum 10 MB. Videos: maximum 100 MB.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="caption"
          className="text-sm font-medium"
        >
          Caption
        </label>

        <textarea
          id="caption"
          value={caption}
          maxLength={500}
          disabled={status === "uploading"}
          onChange={(event) =>
            setCaption(event.target.value)
          }
          placeholder="Tell us about this moment..."
          className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />

        <p className="text-xs text-muted-foreground">
          {caption.length}/500
        </p>
      </div>

      {file && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-medium">{file.name}</p>
          <p className="text-muted-foreground">
            {file.type} ·{" "}
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {message && (
        <p
          className={`text-sm ${
            status === "error"
              ? "text-destructive"
              : status === "success"
                ? "text-green-600"
                : "text-muted-foreground"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={!file || status === "uploading"}
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "uploading"
          ? "Uploading..."
          : "Submit media"}
      </button>
    </form>
  );
}