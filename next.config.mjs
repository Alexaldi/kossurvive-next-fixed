
/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const remotePatterns = [];

if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch (error) {
    console.warn("Tidak bisa mem-parsing NEXT_PUBLIC_SUPABASE_URL untuk konfigurasi gambar:", error?.message || error);
  }
}

const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  images: {
    domains: ['lh3.googleusercontent.com'],
    remotePatterns,
  }
};
export default nextConfig;
