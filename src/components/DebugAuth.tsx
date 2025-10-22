import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export function DebugAuth() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  return (
    <div className="p-4 bg-gray-100 m-4 rounded">
      <h3 className="font-bold mb-2">Debug Auth State</h3>
      <div>Auth Loading: {authLoading ? 'true' : 'false'}</div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>Profile Loading: {profileLoading ? 'true' : 'false'}</div>
      <div>Profile: {profile ? JSON.stringify(profile, null, 2) : 'null'}</div>
    </div>
  );
}