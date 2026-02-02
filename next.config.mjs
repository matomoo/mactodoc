/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/default",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      // Allow all HTTPS images from any domain (wildcard)
      {
        protocol: "https",
        hostname: "**", // Double asterisk allows all hostnames
      },
    ],
  },
};

export default nextConfig;
