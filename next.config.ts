import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Configuración de imágenes para permitir dominios externos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'custom-images.strikinglycdn.com',
        pathname: '/res/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
    // Formato alternativo para compatibilidad
    domains: ['custom-images.strikinglycdn.com', 'localhost'],
  },

  // Si necesitas hacer proxy de las peticiones API a través de Next.js
  // descomenta y ajusta esta configuración:
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3000/api/:path*',
  //     },
  //   ];
  // },
};

export default nextConfig;
