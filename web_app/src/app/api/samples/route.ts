import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { sampleService } from '@/services/sample.service';

export const GET = withApiAuth(async ({ user }) => {
  const samples = await sampleService.getHistory(user.id);
  return jsend.success(samples);
});

export const DELETE = withApiAuth(async ({ user, req }) => {
  const body = await req.json();
  const { ids } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return jsend.error('Invalid IDs provided', 400);
  }

  await sampleService.deleteSamples(ids, user.id);
  return jsend.success(null);
});
