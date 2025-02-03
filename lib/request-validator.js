import { z } from 'zod';

const ScrapeSchema = z.object({
  location: z.string().min(2).max(100),
  maxPages: z.number().int().min(1).max(5),
});

export async function validateRequest(request) {
  try {
    const body = await request.json();
    const validation = ScrapeSchema.safeParse(body);

    if (!validation.success) {
      return validation.error.flatten();
    }

    return null;
  } catch (error) {
    return { error: 'Invalid JSON body' };
  }
}