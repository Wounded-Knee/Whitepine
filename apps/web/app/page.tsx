import { Dashboard } from '@/components/Dashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  return <Dashboard session={session} />;
}
