import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { analyzeSampleSchema } from '@/lib/validations/sample.schema';
import { sampleService } from '@/services/sample.service';

export const POST = withApiAuth(async ({ req }) => {
  const body = await req.json();
  const validated = analyzeSampleSchema.parse(body);

  const result = await sampleService.analyzeSample(
    validated.image,
    validated.metal_type,
  );

  return jsend.success(result);
});
