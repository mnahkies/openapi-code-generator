import nextra from 'nextra'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const withNextra =nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './src/theme.config.tsx'
})

export default withNextra(nextConfig);
