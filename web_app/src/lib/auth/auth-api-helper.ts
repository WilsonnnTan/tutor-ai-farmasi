import { headers } from 'next/headers';

import { ApiError } from '../error';
import { auth } from './auth';

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    throw new ApiError('Unauthorized access attempt detected', 401);
  }

  return session.user;
}
