import React from 'react';

import useAuth from '@/hooks/useAuth';
import { withAuth } from '@/hocs/withAuth';

export default function Home() {
  const { profile } = useAuth();
  return (
    <div>
      {`Bem vindo ${profile.name}`}
    </div>
  );
}

export const getServerSideProps = withAuth(async (ctx, { profile }) => ({
  props: {
    profile,
  },
}));
