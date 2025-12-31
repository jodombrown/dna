/**
 * Archived Feature Detail Page
 * Redirects to the main release detail page
 * Route: /features/archived/:slug
 *
 * This page uses the same ReleaseDetail component but is accessible
 * via the /features/archived/:slug URL for backwards compatibility
 * and semantic URL structure.
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Archive, ExternalLink } from 'lucide-react';
import { useRelease } from '@/hooks/useReleases';
import {
  ReleaseHero,
  FeatureList,
  CategoryTag,
  StatusBadge,
} from '@/components/releases';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ArchivedFeatureDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: release, isLoading, error } = useRelease(slug || '');

  // Handle not found
  if (!isLoading && !release) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Feature not found</h1>
          <p className="text-gray-600 mb-6">
            This archived feature doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => navigate('/features/archived')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Archived Features
          </Button>
        </div>
      </div>
    );
  }

  // Handle error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to load feature</h1>
          <p className="text-gray-600 mb-6">
            Please try refreshing the page.
          </p>
          <Button onClick={() => navigate('/features/archived')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Archived Features
          </Button>
        </div>
      </div>
    );
  }

  const releaseDate = release
    ? new Date(release.release_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <>
      {release && (
        <Helmet>
          <title>{release.title} (Archived) | DNA Platform</title>
          <meta
            name="description"
            content={`Archived feature: ${release.subtitle || release.description.slice(0, 160)}`}
          />
          <link rel="canonical" href={`/releases/${release.slug}`} />
        </Helmet>
      )}

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/features/archived"
              className="inline-flex items-center gap-2 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Archived Features
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="aspect-video rounded-xl mb-8" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
          </div>
        )}

        {/* Content */}
        {release && (
          <article className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Archived Notice */}
            <Alert className="mb-6 bg-slate-100 border-slate-300">
              <Archive className="h-4 w-4 text-slate-600" />
              <AlertDescription className="text-slate-700">
                <strong>Archived Feature:</strong> This feature was released on {releaseDate}.
                The functionality may have been updated since this announcement.{' '}
                <Link to={`/releases/${release.slug}`} className="underline hover:no-underline">
                  View current release page
                </Link>
              </AlertDescription>
            </Alert>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <StatusBadge stage="archived" />
              <CategoryTag category={release.category} />
              {release.version && (
                <span className="text-sm font-medium text-gray-500">
                  v{release.version}
                </span>
              )}
              <span className="text-sm text-gray-500">{releaseDate}</span>
            </div>

            {/* Hero */}
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg mb-8 opacity-90">
              <ReleaseHero
                heroType={release.hero_type}
                imageUrl={release.hero_image_url}
                videoUrl={release.hero_video_url}
                category={release.category}
                className="absolute inset-0"
              />
              {/* Archived overlay */}
              <div className="absolute inset-0 bg-slate-900/10" />
            </div>

            {/* Title */}
            <header className="mb-8">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {release.title}
              </h1>
              {release.subtitle && (
                <p className="text-xl text-gray-600 italic">
                  {release.subtitle}
                </p>
              )}
            </header>

            {/* Description */}
            <div className="prose prose-lg max-w-none mb-10">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {release.description}
              </p>
            </div>

            {/* Features */}
            {release.features && release.features.length > 0 && (
              <FeatureList
                features={release.features.map((f: any) => typeof f === 'string' ? f : f.feature_text)}
                title="What Was Included"
                className="mb-10"
              />
            )}

            {/* Current Documentation Link */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-10">
              <h3 className="font-semibold text-gray-900 mb-2">
                Looking for current documentation?
              </h3>
              <p className="text-gray-600 mb-4">
                This is an archived release. For the latest information about this feature,
                visit the current release page or documentation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to={`/releases/${release.slug}`}>
                    View Release Page
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/releases">
                    Browse All Releases
                  </Link>
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                to="/features/archived"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                All Archived Features
              </Link>
              <Link
                to="/releases"
                className="inline-flex items-center gap-2 text-dna-emerald font-medium hover:underline"
              >
                What&apos;s New
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </article>
        )}
      </div>
    </>
  );
};

export default ArchivedFeatureDetail;
