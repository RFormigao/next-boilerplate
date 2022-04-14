import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth';

function useAuth() {
  const { profile } = useContext(AuthContext);

  return {
    profile,
  };
}

export default useAuth;
