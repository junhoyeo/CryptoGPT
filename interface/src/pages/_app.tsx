import { AppProps } from 'next/app';
import React from 'react';
import { GlobalStyle } from '@/components/GlobalStyle';
import '@/styles/globals.css';
import Head from 'next/head';

const meta = {
  title: 'CryptoGPT — An experiment by @junhoyeo for LLMs achieving Financial Autonomy',
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <title>{meta.title}</title>
        <meta name="title" content={meta.title} />
      </Head>

      <GlobalStyle />
      <Component {...pageProps} />

      <div id="portal" />
    </React.Fragment>
  );
}

export default MyApp;
