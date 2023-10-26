module.exports = {
  reactStrictMode: true,
  transpilePackages: ["components", "rpc", "utils"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/dev-user-images-bucket/**",
      },
    ],
  },
};
