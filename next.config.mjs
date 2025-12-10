/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Tắt tối ưu hóa của Next Image cho tất cả ảnh remote
    // để tránh lỗi 400 khi proxy ảnh từ ngrok / môi trường bên ngoài.
    // Next.js sẽ render <img> bình thường với URL backend trả về.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5240',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7252',
        pathname: '/uploads/**',
      },
      {
        // Ngrok public URL for backend file storage (product images, etc.)
        protocol: 'https',
        hostname: '32e104a2aa0f.ngrok-free.app',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
