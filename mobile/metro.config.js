// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = withNativewind(getDefaultConfig(__dirname));

const parentResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolveRequest = parentResolveRequest ?? context.resolveRequest;

  if (moduleName === 'react-native-paper') {
    return resolveRequest(context, 'react-native-paper/lib/commonjs/index.js', platform);
  }

  return resolveRequest(context, moduleName, platform);
};

module.exports = config;
