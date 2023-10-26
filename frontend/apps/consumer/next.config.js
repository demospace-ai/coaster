const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  transpilePackages: ["@coaster/components", "@coaster/rpc", "@coaster/utils"],
});