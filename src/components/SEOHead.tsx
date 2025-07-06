import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "DNA - Diaspora Network of Africa | Connect, Collaborate, Contribute",
  description = "Join the global African diaspora network. Connect with professionals, collaborate on impactful projects, and contribute to Africa's development. Building bridges across continents for African advancement.",
  keywords = "African diaspora, Africa development, professional network, diaspora platform, African professionals, impact network, collaborate Africa, contribute Africa, African community, diaspora connection",
  image = "/og-image.png",
  url = "https://diasporanetwork.africa",
  type = "website",
  author = "Diaspora Network of Africa",
  publishedTime,
  modifiedTime
}) => {
  const siteTitle = "Diaspora Network of Africa";
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@DiasporaNetworkAfrica" />
      <meta name="twitter:creator" content="@DiasporaNetworkAfrica" />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          <meta property="article:author" content={author} />
          <meta property="article:section" content="African Diaspora" />
          <meta property="article:tag" content="African diaspora" />
          <meta property="article:tag" content="Professional network" />
          <meta property="article:tag" content="Africa development" />
        </>
      )}
      
      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#059669" />
      <meta name="msapplication-TileColor" content="#059669" />
      <meta name="application-name" content={siteTitle} />
      
      {/* Language and Region */}
      <meta httpEquiv="content-language" content="en-US" />
      <meta name="geo.region" content="Global" />
      <meta name="geo.placename" content="Global African Diaspora" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": siteTitle,
          "description": description,
          "url": url,
          "logo": `${url}/logo.png`,
          "sameAs": [
            "https://twitter.com/DiasporaNetworkAfrica",
            "https://linkedin.com/company/diaspora-network-africa"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-DNA-NETWORK",
            "contactType": "customer service",
            "availableLanguage": ["English", "French", "Portuguese", "Arabic"]
          },
          "founder": {
            "@type": "Organization",
            "name": "DNA Foundation"
          },
          "foundingDate": "2024",
          "knowsAbout": [
            "African Diaspora",
            "Professional Networking",
            "Africa Development",
            "Cross-border Collaboration",
            "Impact Investment"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;