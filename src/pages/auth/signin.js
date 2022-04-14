import React from 'react';

import Signin from '@/modules/auth/signin';
import { withGuest } from '@/hocs/withGuest';

function SigninPage() {
  return (
    <Signin />
  );
}

export const getServerSideProps = withGuest(async () => ({
  props: {},
}));

export default SigninPage;
