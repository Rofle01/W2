/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sitenin statik HTML çıktısı vermesini sağlar
  output: 'export',

  // Next.js'in resim optimizasyonunu kapatır 
  // (Cloudflare ücretsiz planda resim sunucusu yoktur, bu ayar şarttır)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
