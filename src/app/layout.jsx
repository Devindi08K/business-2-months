import siteConfig from "../../site.config";
import "./globals.css";

export const metadata = {
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={siteConfig.fonts.googleFontsUrl} rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
