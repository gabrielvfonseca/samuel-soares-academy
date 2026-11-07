import { z } from "zod";

export const StatSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const StatsSchema = z.array(StatSchema);

export type Stat = z.infer<typeof StatSchema>;
export type Stats = z.infer<typeof StatsSchema>;
