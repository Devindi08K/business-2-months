import siteConfig from "../../site.config";
import en from "@/i18n/en";
import si from "@/i18n/si";

const dictionaries = { en, si };

export function getDictionary(locale = "en") {
  return dictionaries[locale] || dictionaries.en;
}

export function t(locale, key, fallback) {
  const dict = getDictionary(locale);
  const parts = key.split(".");
  let cur = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return fallback || key;
  }
  return typeof cur === "string" ? cur : fallback || key;
}

export function availableLocales() {
  return siteConfig.locales?.available || ["en"];
}
