import { z } from "zod";

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const allowedVideoTypes = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

const allowedMediaTypes = [
  ...allowedImageTypes,
  ...allowedVideoTypes,
] as const;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export const mediaPresignSchema = z
  .object({
    registrationId: z.string().min(1),
    fileName: z.string().trim().min(1).max(255),
    contentType: z.enum(allowedMediaTypes),
    fileSize: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    const isImage = data.contentType.startsWith("image/");
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

    if (data.fileSize > maxSize) {
      ctx.addIssue({
        code: "custom",
        path: ["fileSize"],
        message: isImage
          ? "Images must be 10 MB or smaller"
          : "Videos must be 100 MB or smaller",
      });
    }
  });

export type MediaPresignInput = z.infer<typeof mediaPresignSchema>;