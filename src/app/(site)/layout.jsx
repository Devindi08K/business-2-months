import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import JsonLd from "@/components/public/JsonLd";
import { getSiteSettings, themeCssVars } from "@/lib/settings";
import { getDictionary } from "@/lib/i18n";
import siteConfig from "../../../site.config";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  try {
    const settings = await getSiteSettings();
    const base = process.env.NEXT_PUBLIC_SITE_URL || undefined;
    return {
      metadataBase: base ? new URL(base) : undefined,
      title: {
        default: settings.seo?.defaultTitle || settings.businessName,
        template: settings.seo?.titleTemplate || `%s | ${settings.businessName}`,
      },
      description: settings.seo?.description,
      keywords: settings.seo?.keywords,
      openGraph: {
        title: settings.seo?.defaultTitle,
        description: settings.seo?.description,
        images: settings.seo?.ogImage ? [settings.seo.ogImage] : [],
        locale: settings.seo?.locale || "en_LK",
        type: "website",
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return {
      title: siteConfig.seo.defaultTitle,
      description: siteConfig.seo.description,
    };
  }
}

export default async function SiteLayout({ children }) {
  let settings;
  try {
    settings = await getSiteSettings();
  } catch {
    settings = {
      businessName: siteConfig.businessName,
      tagline: siteConfig.tagline,
      logo: siteConfig.logo,
      phone: siteConfig.contact.phone,
      phoneRaw: siteConfig.contact.phoneRaw,
      email: siteConfig.contact.email,
      whatsapp: siteConfig.contact.whatsapp,
      address: siteConfig.contact.address,
      mapEmbedUrl: siteConfig.contact.mapEmbedUrl,
      mapLink: siteConfig.contact.mapLink,
      social: siteConfig.social,
      hours: siteConfig.hours,
      colors: siteConfig.colors,
      fonts: siteConfig.fonts,
      hero: siteConfig.hero,
      about: siteConfig.about,
      seo: siteConfig.seo,
      features: siteConfig.features,
      currency: siteConfig.currency,
      itemLabels: siteConfig.itemLabels,
    };
  }

  const dict = getDictionary("en");
  const cssVars = themeCssVars(settings.colors);
  const style = {
    ...cssVars,
    "--font-heading": `"${settings.fonts?.heading || siteConfig.fonts.heading}", Georgia, serif`,
    "--font-body": `"${settings.fonts?.body || siteConfig.fonts.body}", system-ui, sans-serif`,
  };

  return (
    <div className="bg-atmosphere min-h-screen" style={style}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header settings={settings} dict={dict} />
      <div id="main">{children}</div>
      <Footer settings={settings} dict={dict} />
      {settings.features?.whatsappButton !== false ? (
        <WhatsAppButton number={settings.whatsapp} />
      ) : null}
      {settings.features?.clickToCall !== false && settings.phoneRaw ? (
        <a
          href={`tel:${settings.phoneRaw}`}
          className="fixed bottom-5 left-5 z-40 rounded-full bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-lg sm:hidden"
        >
          {dict.common.callUs}
        </a>
      ) : null}
      <JsonLd settings={settings} />
    </div>
  );
}
