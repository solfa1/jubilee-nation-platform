import { z } from "zod";

export const registrationSchema = z.object({
  eventSlug: z.string().min(1),

  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),

  phone: z.string().trim().min(7).max(20),

  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("")),

  instagramHandle: z.string().trim().max(100).optional(),
  twitterHandle: z.string().trim().max(100).optional(),
  facebookHandle: z.string().trim().max(150).optional(),
  tiktokHandle: z.string().trim().max(100).optional(),

  location: z.string().trim().max(150).optional(),

  firstTimeVisitor: z.boolean(),

  consentFollowUp: z.boolean().refine((value) => value === true, {
    message: "Follow-up consent is required",
  }),

  consentMedia: z.boolean(),
consentTestimony: z.boolean(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;