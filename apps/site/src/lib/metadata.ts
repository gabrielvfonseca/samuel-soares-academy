import merge from "lodash.merge";
import type { Metadata } from "next";
import { env } from "@/env";
import { BRAND_NAME, SITE_URL, SOCIAL_HANDLES } from "@/globals/constants";

interface MetadataGenerator {
  description: string;
  image?: string;
  title: string;
}

const applicationName = BRAND_NAME;
const author: Metadata["authors"] = {
  name: BRAND_NAME,
  url: SITE_URL,
};

const publisher = BRAND_NAME;
const twitterHandle = SOCIAL_HANDLES.twitter;

const protocol = env.NODE_ENV === "production" ? "https" : "http";
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const createMetadata = ({
  title,
  description,
  image,
  ...properties
}: MetadataGenerator): Metadata => {
  const parsedTitle = `${title} | ${applicationName}`;
  const defaultMetadata: Metadata = {
    alternates: {
      canonical: SITE_URL,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: parsedTitle,
    },
    applicationName,
    authors: [author],
    category: "sports",
    creator: author.name,
    description,
    formatDetection: {
      telephone: false,
    },
    keywords: [
      "futebol kids",
      "escola de futebol",
      "treino de futebol para crianças",
      "academia de futebol",
      "futebol infantil porto",
      "desporto infantil",
    ],
    metadataBase: productionUrl
      ? new URL(`${protocol}://${productionUrl}`)
      : undefined,
    openGraph: {
      description,
      locale: "pt_PT",
      siteName: applicationName,
      title: parsedTitle,
      type: "website",
      url: SITE_URL,
    },
    publisher,
    robots: {
      follow: true,
      googleBot: {
        follow: true,
        index: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
      index: true,
    },
    title: parsedTitle,
    twitter: {
      card: "summary_large_image",
      creator: twitterHandle,
      description,
      site: twitterHandle,
      title: parsedTitle,
    },
  };

  const metadata: Metadata = merge(defaultMetadata, properties);

  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        alt: title,
        height: 630,
        url: image,
        width: 1200,
      },
    ];
  }

  return metadata;
};
