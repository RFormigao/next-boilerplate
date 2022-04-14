import React from 'react';
import App from 'next/app';
import Head from 'next/head';

import { AuthProvider } from '@/contexts/auth';

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    const { profile } = pageProps;

    return (
      <>
        <Head>
          <link rel="shortcut icon" href="/images/favicon.png" />
          <meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
        </Head>
        <AuthProvider profile={profile}>
          <Component {...pageProps} />
        </AuthProvider>
      </>
    );
  }
}

export default MyApp;
