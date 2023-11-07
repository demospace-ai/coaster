const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  transpilePackages: ["@coaster/components", "@coaster/rpc/client", "@coaster/utils/common"],
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
      {
        protocol:"https",
        hostname:"lh3.googleusercontent.com",
        port:"",
        pathname: "/**"
      },
      {
        protocol:"https",
        hostname: "cdn.sanity.io",
        port:"",
        pathname: "/**"
      }
    ],
  },
  experimental:{
    optimizePackageImports: [
      "@coaster/components",
      "@coaster/rpc/client",
      "@coaster/rpc/common",
      "@coaster/rpc/server",
      "@coaster/utils/client",
      "@coaster/utils/common",
      "@coaster/assets",
    ],
  }
});