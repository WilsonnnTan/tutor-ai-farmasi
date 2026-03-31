import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { sampleService } from '@/services/sample.service';

export const GET = withApiAuth(async ({ user }) => {
  const samples = await sampleService.getHistory(user.id);
  return jsend.success(samples);
});
