"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TestimonyFormProps = {
  registrationId: string;
};

export function TestimonyForm({
  registrationId,
}: TestimonyFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length < 3) {
      setStatus("error");
      setMessage("Title must be at least 3 characters.");
      return;
    }

    if (trimmedContent.length < 10) {
      setStatus("error");
      setMessage("Testimony must be at least 10 characters.");
      return;
    }

    try {
      setStatus("submitting");

      const response = await fetch("/api/testimonies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
          title: trimmedTitle,
          content: trimmedContent,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body.error ?? "Unable to submit testimony"
        );
      }

      setStatus("success");
      setMessage(
        "Thank you. Your testimony has been submitted for review."
      );

      setTitle("");
      setContent("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit testimony"
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
          htmlFor="title"
          className="text-sm font-medium"
        >
          Testimony title
        </label>

        <Input
          id="title"
          value={title}
          maxLength={120}
          disabled={status === "submitting"}
          placeholder="Give your testimony a short title"
          onChange={(event) => {
            setTitle(event.target.value);

            if (status === "error") {
              setStatus("idle");
              setMessage("");
            }
          }}
        />

        <p className="text-xs text-muted-foreground">
          {title.length}/120
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="content"
          className="text-sm font-medium"
        >
          Your testimony
        </label>

        <textarea
          id="content"
          value={content}
          maxLength={5000}
          disabled={status === "submitting"}
          placeholder="Share what God has done..."
          onChange={(event) => {
            setContent(event.target.value);

            if (status === "error") {
              setStatus("idle");
              setMessage("");
            }
          }}
          className="min-h-48 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />

        <p className="text-xs text-muted-foreground">
          {content.length}/5000
        </p>
      </div>

      {message && (
        <p
          className={
            status === "error"
              ? "text-sm text-destructive"
              : status === "success"
                ? "text-sm text-green-600"
                : "text-sm text-muted-foreground"
          }
        >
          {message}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={status === "submitting"}
      >
        {status === "submitting"
          ? "Submitting..."
          : "Submit testimony"}
      </Button>
    </form>
  );
}