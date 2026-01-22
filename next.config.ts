import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Production optimization */
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,

  /* TypeScript configuration */
};

export default nextConfig;
