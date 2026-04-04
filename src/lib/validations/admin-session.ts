import { z } from "zod";

export const adminSessionSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().min(10).max(280),
  longDescription: z.string().min(20),
  categoryId: z.string().min(8),
  durationMinutes: z.coerce.number().int().min(1).max(120),
  intensity: z.enum(["light", "medium", "deep"]),
  tone: z.enum(["soft", "grounding", "uplifting", "sensual_soft", "sleep"]),
  contraindicationNote: z.string().optional(),
  voiceStyle: z.enum(["calm", "warm", "confident", "bedtime_soft"]),
  coverGradient: z.string().min(2).max(64),
  published: z.preprocess(
    (v) => v === "true" || v === "on" || v === true,
    z.boolean()
  ),
  freeTier: z.preprocess((v) => v === "true" || v === "on" || v === true, z.boolean()),
  tagIds: z.array(z.string()).optional(),
  scriptJson: z.string().min(10),
});

export const aiGeneratorFormSchema = z.object({
  targetMood: z.string().min(1),
  category: z.string().min(1),
  duration: z.coerce.number().int().min(3).max(45),
  tone: z.string().min(1),
  goal: z.string().min(5),
  voiceStyle: z.string().min(1),
  forbiddenPhrases: z.string().optional(),
});

export type AdminSessionInput = z.infer<typeof adminSessionSchema>;
