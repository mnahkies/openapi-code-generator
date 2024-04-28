import nextra from 'nextra'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects(){
    return [
      {source: '/', destination: '/overview/about', permanent: false},
    ]
  }
};

const withNextra =nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './src/theme.config.tsx'
})

export default withNextra(nextConfig);
