import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir acesso de dispositivos na rede local (celular, etc)
  allowedDevOrigins: ['192.168.88.202', 'localhost', '192.168.*.*'],
  
  // Otimizações de performance
  poweredByHeader: false,
  compress: true,
  
  // Otimização de imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Formatos modernos para menor tamanho
    formats: ['image/avif', 'image/webp'],
    // Tamanhos de dispositivo para otimização
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Minimizar qualidade para mobile
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
  },

  // Headers de cache
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
