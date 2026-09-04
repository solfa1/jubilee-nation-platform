import { z } from "zod";

export const testimonySubmissionSchema = z.object({
  registrationId: z.string().min(1),

  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or fewer"),

  content: z
    .string()
    .trim()
    .min(10, "Testimony must be at least 10 characters")
    .max(5000, "Testimony must be 5000 characters or fewer"),
});

export type TestimonySubmissionInput = z.infer<
  typeof testimonySubmissionSchema
>;