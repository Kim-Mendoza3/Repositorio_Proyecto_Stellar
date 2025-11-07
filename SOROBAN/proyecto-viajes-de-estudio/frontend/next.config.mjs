/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable WebAuthn/Passkey support
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  
  webpack: (config, { dev, isServer }) => {
    // Resolve fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Ignore warnings from native modules
    if (!isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/sodium-native/ },
        { module: /node_modules\/require-addon/ },
        /Critical dependency/,
      ];
    }

    return config;
  },

  experimental: {
    esmExternals: true,
  },
};

export default nextConfig;
