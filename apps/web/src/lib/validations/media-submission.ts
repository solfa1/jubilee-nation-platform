import { z } from "zod";

export const mediaSubmissionSchema = z.object({
  registrationId: z.string().min(1),
  objectKey: z.string().min(1),

  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ]),

  caption: z.string().trim().max(500).optional(),
});

export type MediaSubmissionInput = z.infer<
  typeof mediaSubmissionSchema
>;