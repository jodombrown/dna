import { useParams } from 'react-router-dom';
import { useHubData } from '@/hooks/useHubData';
import { useAuth } from '@/contexts/AuthContext';

// Placeholder components - will be built in Session 5
const RegionHero = ({ metadata }: any) => (
  <div className="h-[70vh] min-h-[400px] bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-5xl md:text-7xl font-bold mb-4">{metadata?.name?.toUpperCase()}</h1>
      <p className="text-xl italic opacity-90">"{metadata?.tagline}"</p>
    </div>
  </div>
);

const HubMetrics = ({ metrics }: any) => (
  <div className="bg-white py-6">
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div><div className="text-3xl font-bold text-emerald-600">{metrics?.members_connected?.toLocaleString()}</div><div className="text-sm text-gray-500">Members</div></div>
      <div><div className="text-3xl font-bold text-emerald-600">{metrics?.events_hosted?.toLocaleString()}</div><div className="text-sm text-gray-500">Events</div></div>
      <div><div className="text-3xl font-bold text-emerald-600">{metrics?.projects_active?.toLocaleString()}</div><div className="text-sm text-gray-500">Projects</div></div>
      <div><div className="text-3xl font-bold text-emerald-600">${(metrics?.contributions_total / 1000000).toFixed(1)}M</div><div className="text-sm text-gray-500">Contributed</div></div>
    </div>
  </div>
);

const CountryCardGrid = ({ countries, regionSlug }: any) => (
  <div className="bg-gray-50 py-8">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {countries?.map((country: any) => (
          <a key={country.id} href={`/africa/${regionSlug}/${country.slug}`} className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <img src={country.flag_url} alt={country.name} className="w-12 h-8 object-cover mx-auto mb-2 rounded" />
            <div className="font-semibold text-sm">{country.name}</div>
          </a>
        ))}
      </div>
    </div>
  </div>
);

const FeedSection = ({ type, feed, hubName }: any) => {
  const config: Record<string, { emoji: string; title: string }> = {
    connect: { emoji: '🔗', title: 'CONNECT IN' },
    convene: { emoji: '📅', title: 'CONVENE IN' },
    collaborate: { emoji: '🤝', title: 'COLLABORATE IN' },
  };
  const { emoji, title } = config[type] || { emoji: '📋', title: type.toUpperCase() };

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-emerald-600 mb-6">{emoji} {title} {hubName?.toUpperCase()}</h2>
        {feed?.items?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed.items.map((item: any) => (
              <div key={item.id} className="bg-white rounded-lg border p-4">
                <div className="font-semibold">{item.display_name || item.title}</div>
                <div className="text-sm text-gray-500">{item.headline || item.description_short}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">No {type} items yet</div>
        )}
      </div>
    </div>
  );
};

const HubSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[70vh] bg-gray-200" />
    <div className="h-24 bg-gray-100" />
    <div className="h-64 bg-gray-50" />
  </div>
);

const HubError = ({ error }: any) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Hub</h1>
      <p className="text-gray-500">{error?.message || 'Something went wrong'}</p>
    </div>
  </div>
);

export default function RegionHubPage() {
  const { regionSlug } = useParams<{ regionSlug: string }>();
  const { user } = useAuth();

  const { data, isLoading, error } = useHubData({
    hubType: 'region',
    hubSlug: regionSlug!,
    userId: user?.id
  });

  if (isLoading) return <HubSkeleton />;
  if (error || !data?.success) return <HubError error={error} />;

  const { metadata, metrics } = data.hub;
  const hubName = metadata?.name || 'Region';

  return (
    <div className="region-hub">
      <RegionHero metadata={metadata} />
      <HubMetrics metrics={metrics} />
      <CountryCardGrid countries={metadata?.countries} regionSlug={regionSlug} />
      <FeedSection type="connect" feed={data.feeds.connect} hubName={hubName} />
      <FeedSection type="convene" feed={data.feeds.convene} hubName={hubName} />
      <FeedSection type="collaborate" feed={data.feeds.collaborate} hubName={hubName} />
    </div>
  );
}
