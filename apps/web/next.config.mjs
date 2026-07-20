/** @type {import('next').NextConfig} */
let nextConfig = {
  // @goodtrip/shared ships TypeScript source, not compiled JS.
  transpilePackages: ["@goodtrip/shared"],
};

export default nextConfig;
