import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from './auth';

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return redirect('/login?session_expired=true');
  }
  return session.user;
}
