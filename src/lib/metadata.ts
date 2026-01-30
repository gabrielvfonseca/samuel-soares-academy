import merge from "lodash.merge";
import type { Metadata } from "next";

interface MetadataGenerator {
  title: string;
  description: string;
  image?: string;
}

import { BRAND_NAME, SITE_URL, SOCIAL_HANDLES } from "@/globals/constants";
import { env } from "@/env";

const applicationName = BRAND_NAME;
const author: Metadata["authors"] = {
  name: BRAND_NAME,
  url: SITE_URL,
};

const publisher = BRAND_NAME;
const twitterHandle = SOCIAL_HANDLES.twitter;

const protocol = env.NODE_ENV === "production" ? "https" : "http";
const productionUrl = env.VERCEL_PROJECT_PRODUCTION_URL;

export const createMetadata = ({
  title,
  description,
  image,
  ...properties
}: MetadataGenerator): Metadata => {
  const parsedTitle = `${title} | ${applicationName}`;
  const defaultMetadata: Metadata = {
    title: parsedTitle,
    description,
    applicationName,
    metadataBase: productionUrl ? new URL(`${protocol}://${productionUrl}`) : undefined,
    authors: [author],
    creator: author.name,
    formatDetection: {
      telephone: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: parsedTitle,
    },
    keywords: [
      "futebol kids",
      "escola de futebol",
      "treino de futebol para crianças",
      "academia de futebol",
      "futebol infantil porto",
      "desporto infantil",
    ],
    category: "sports",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: parsedTitle,
      description,
      type: "website",
      siteName: applicationName,
      locale: "pt_PT",
      url: SITE_URL,
    },
    alternates: {
      canonical: SITE_URL,
    },
    publisher,
    twitter: {
      card: "summary_large_image",
      title: parsedTitle,
      description,
      creator: twitterHandle,
      site: twitterHandle,
    },
  };

  const metadata: Metadata = merge(defaultMetadata, properties);

  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      },
    ];
  }

  return metadata;
};
