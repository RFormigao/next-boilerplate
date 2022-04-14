export function withGuest(getServerSideProps) {
  return async (ctx) => {
    try {
      // Check if user is not logged in
      return getServerSideProps(ctx);
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
