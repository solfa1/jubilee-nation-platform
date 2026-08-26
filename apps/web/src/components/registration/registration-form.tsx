"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/lib/validations/registration";

type RegistrationFormProps = {
  eventSlug: string;
};

export function RegistrationForm({
  eventSlug,
}: RegistrationFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      eventSlug,
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      instagramHandle: "",
      twitterHandle: "",
      facebookHandle: "",
      tiktokHandle: "",
      location: "",
      firstTimeVisitor: false,
      consentFollowUp: false,
      consentMedia: false,
      consentTestimony: false,
    },
  });

  async function onSubmit(data: RegistrationInput) {
    setServerError(null);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json();

        throw new Error(
          body.error ?? "Unable to complete registration"
        );
      }

      setSubmitted(true);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to complete registration"
      );
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registration complete</CardTitle>

          <CardDescription>
            Thank you for connecting with Jubilee Nation.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            You can now continue to share your experience, photos,
            videos, or testimony.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect with Jubilee Nation</CardTitle>

        <CardDescription>
          Tell us a little about yourself so we can stay connected
          after the programme.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <input
            type="hidden"
            {...register("eventSlug")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium"
              >
                First name
              </label>

              <Input
                id="firstName"
                autoComplete="given-name"
                {...register("firstName")}
              />

              {errors.firstName && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium"
              >
                Last name
              </label>

              <Input
                id="lastName"
                autoComplete="family-name"
                {...register("lastName")}
              />

              {errors.lastName && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium"
            >
              WhatsApp / phone number
            </label>

            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+234..."
              {...register("phone")}
            />

            {errors.phone && (
              <p className="mt-1 text-sm text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
              <span className="ml-1 text-muted-foreground">
                (optional)
              </span>
            </label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />

            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium"
            >
              Location
              <span className="ml-1 text-muted-foreground">
                (optional)
              </span>
            </label>

            <Input
              id="location"
              placeholder="Abuja"
              {...register("location")}
            />
          </div>

          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer text-sm font-medium">
              Add social media handles
            </summary>

            <div className="mt-4 grid gap-4">
              <Input
                placeholder="Instagram"
                {...register("instagramHandle")}
              />

              <Input
                placeholder="X / Twitter"
                {...register("twitterHandle")}
              />

              <Input
                placeholder="Facebook"
                {...register("facebookHandle")}
              />

              <Input
                placeholder="TikTok"
                {...register("tiktokHandle")}
              />
            </div>
          </details>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1"
              {...register("firstTimeVisitor")}
            />

            <span className="text-sm">
              This is my first time attending a Jubilee Nation
              programme.
            </span>
          </label>

          <div className="space-y-4 rounded-lg border p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                {...register("consentFollowUp")}
              />

              <span className="text-sm">
                Jubilee Nation may contact me after this programme.
              </span>
            </label>

            {errors.consentFollowUp && (
              <p className="text-sm text-destructive">
                {errors.consentFollowUp.message}
              </p>
            )}

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                {...register("consentMedia")}
              />

              <span className="text-sm">
                Jubilee Nation may use media I later submit.
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                {...register("consentTestimony")}
              />

              <span className="text-sm">
                Jubilee Nation may display a testimony I later
                submit.
              </span>
            </label>
          </div>

          {serverError && (
            <p className="text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Registering..."
              : "Complete registration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}