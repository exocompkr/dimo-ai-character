/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // sharp는 네이티브 바이너리(libvips) 를 가지는 모듈이라 Turbopack 번들에
  // 인라인되면 Vercel(linux-x64) 런타임에서 .so 파일을 못 찾는다.
  // serverExternalPackages 에 등록하면 번들 제외 + 노드 require 로 로드.
  serverExternalPackages: ["sharp"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "http",  hostname: "localhost", port: "8080" },
    ],
  },
};

export default nextConfig;
