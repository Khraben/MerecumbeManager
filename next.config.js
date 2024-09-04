const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true, // Habilita soporte para styled-components
  },
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};

module.exports = nextConfig;
