const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  transpilePackages: ["components, rpc, utils"],
  experimental:{
    optimizePackageImports: [
      "@coaster/components/client",
      "@coaster/components/common",
      "@coaster/components/server",
      "@coaster/rpc/client",
      "@coaster/rpc/common",
      "@coaster/rpc/server",
      "@coaster/utils/client",
      "@coaster/utils/common",
      "@coaster/state",
      "@coaster/assets",
    ],
  }
});
