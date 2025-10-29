import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
    },
};

const pwaConfig = {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    buildExcludes: [/app-build-manifest\.json$/],
};

export default withPWA(pwaConfig)(nextConfig);