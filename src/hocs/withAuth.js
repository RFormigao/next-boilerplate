export function withAuth(getServerSideProps) {
  return async (ctx) => {
    try {
      // Check if user is logged in
      const profile = {
        name: 'John Doe',
        email: 'john_doe@example.com',
      };

      return getServerSideProps(ctx, { profile });
    } catch (error) {
      return {
        redirect: {
          destination: '/auth/signin',
          permanent: false,
        },
      };
    }
  };
}

export default {};
