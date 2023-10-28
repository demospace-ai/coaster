const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  transpilePackages: ["@coaster/components", "@coaster/rpc", "@coaster/utils"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/dev-user-images-bucket/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/user-images-bucket-us/**",
      },
    ],
  },
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
