const { withPlugins } = require('next-composed-plugins');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const findWorkspaceRoot = require('find-yarn-workspace-root');
const dotenv = require('dotenv');
const path = require('path');

const WORKSPACE_ROOT_PATH = findWorkspaceRoot(null) ?? '';
dotenv.config({
  path: path.resolve(WORKSPACE_ROOT_PATH, '.env'),
});

const pick = (obj, keys) =>
  keys.reduce(
    (result, key) => ({
      ...result,
      [key]: obj[key],
    }),
    {},
  );

module.exports = withPlugins(
  {
    swcMinify: true,
    reactStrictMode: true,
    compiler: {
      styledComponents: true,
    },
    publicRuntimeConfig: pick(process.env, ['OPENAI_API_KEY', 'JSON_RPC_URL', 'WALLET_PRIVATE_KEY']),
  },
  [withBundleAnalyzer],
);
