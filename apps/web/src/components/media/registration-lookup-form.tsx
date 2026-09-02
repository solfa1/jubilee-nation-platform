"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RegistrationLookupFormProps = {
  eventSlug: string;
};

type RegistrationLookupResponse = {
  registrationId: string;
};

export function RegistrationLookupForm({
  eventSlug,
}: RegistrationLookupFormProps) {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    const normalizedPhone = phone.trim();

    if (!normalizedPhone) {
      setError("Enter the phone number you registered with.");
      return;
    }

    if (!/^\+234\d{10}$/.test(normalizedPhone)) {
      setError(
        "Enter your phone number in +234 format, for example +2348012345678."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/registrations/lookup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: normalizedPhone,
            eventSlug,
          }),
        }
      );

      const body = (await response.json()) as
        | RegistrationLookupResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in body && body.error
            ? body.error
            : "Unable to find registration"
        );
      }

      if (!("registrationId" in body)) {
        throw new Error("Registration ID was not returned");
      }

      router.push(`/upload/${body.registrationId}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to find registration"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border p-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="phone"
          className="text-sm font-medium"
        >
          Phone number
        </label>

        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+2348012345678"
          value={phone}
          disabled={loading}
          onChange={(event) => {
            setPhone(event.target.value);

            if (error) {
              setError(null);
            }
          }}
        />

        <p className="text-xs text-muted-foreground">
          Use the same +234 phone number you entered when you
          registered.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading
          ? "Checking registration..."
          : "Continue to upload"}
      </Button>
    </form>
  );
}