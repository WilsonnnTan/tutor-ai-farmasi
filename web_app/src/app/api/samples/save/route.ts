import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { saveSampleSchema } from '@/lib/validations/sample.schema';
import { sampleService } from '@/services/sample.service';

export const POST = withApiAuth(async ({ user, req }) => {
  const body = await req.json();
  const validated = saveSampleSchema.parse(body);

  const sample = await sampleService.saveSampleResult(user.id, {
    sample_name: validated.sample_name,
    test_date: validated.test_date,
    metal_type: validated.metal_type,
    concentration: validated.concentration,
    rgb_value: validated.rgb_value,
    image: validated.image,
  });

  return jsend.success(sample, 201);
});
