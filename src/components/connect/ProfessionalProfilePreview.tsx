import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Professional } from '@/types/search';
import { MapPin, Link as LinkIcon, Globe, Award, Languages, Briefcase } from 'lucide-react';
import { demoCommunities } from '@/data/demoSearchData';

interface ProfessionalProfilePreviewProps {
  professional: Professional;
  onConnect: (id: string) => void;
  onMessage: (id: string, name: string) => void;
}

const InfoRow: React.FC<{ label: string; value?: React.ReactNode } > = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-right ml-4">{value}</span>
    </div>
  );
};

const ProfessionalProfilePreview: React.FC<ProfessionalProfilePreviewProps> = ({ professional, onConnect, onMessage }) => {
  const suggestedCommunities = demoCommunities.slice(0, 3);

  return (
    <article className="space-y-6">
      {/* Cover + Header */}
      <header>
        <div className="h-24 w-full rounded-t-lg bg-gradient-to-r from-dna-emerald/30 via-dna-copper/20 to-dna-gold/20" />
        <div className="flex items-start gap-4 -mt-10 px-1">
          <img
            src={professional.avatar_url}
            alt={`Profile photo of ${professional.full_name}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow -mt-6"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{professional.full_name}</h1>
            {professional.profession && (
              <p className="text-dna-emerald font-semibold">{professional.profession}</p>
            )}
            {professional.company && (
              <p className="text-gray-600">{professional.company}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {(professional.location || professional.country_of_origin) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {professional.location}
                  {professional.country_of_origin && (
                    <>
                      <span>•</span>
                      <span>Originally from {professional.country_of_origin}</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button 
            className="bg-dna-emerald hover:bg-dna-forest text-white"
            onClick={() => onConnect(professional.id)}
          >
            Connect
          </Button>
          <Button 
            variant="outline"
            onClick={() => onMessage(professional.id, professional.full_name)}
          >
            Message
          </Button>
        </div>
      </header>

      {/* Quick badges */}
      <section className="flex flex-wrap gap-2">
        {professional.is_mentor && (
          <Badge className="bg-dna-emerald/15 text-dna-emerald">Mentor</Badge>
        )}
        {professional.is_investor && (
          <Badge className="bg-dna-copper/15 text-dna-copper">Investor</Badge>
        )}
        {professional.looking_for_opportunities && (
          <Badge variant="outline">Open to opportunities</Badge>
        )}
      </section>

      {/* About */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-2">About</h2>
        <p className="text-gray-700 leading-relaxed">
          {professional.bio || "This professional hasn't added a bio yet."}
        </p>
      </section>

      {/* Skills */}
      {professional.skills && professional.skills.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {professional.skills.slice(0, 12).map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-dna-emerald/10 text-dna-emerald rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience snapshot */}
      {(professional.years_experience !== undefined || professional.education || professional.languages) && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Experience Snapshot</h2>
          <div className="grid sm:grid-cols-2 gap-4 rounded-lg border p-4 bg-white">
            <InfoRow label="Years experience" value={professional.years_experience !== undefined ? `${professional.years_experience}+` : undefined} />
            <InfoRow label="Education" value={professional.education} />
            <InfoRow label="Languages" value={professional.languages?.join(', ')} />
          </div>
        </section>
      )}

      {/* Availability */}
      {professional.availability_for && professional.availability_for.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Available For</h2>
          <div className="flex flex-wrap gap-2">
            {professional.availability_for.map((s, i) => (
              <Badge key={i} className="bg-dna-emerald/20 text-dna-emerald">{s}</Badge>
            ))}
          </div>
        </section>
      )}

      {/* Links */}
      {(professional.linkedin_url || professional.website_url) && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Links</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {professional.linkedin_url && (
              <a href={professional.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-dna-emerald underline">
                <LinkIcon className="w-4 h-4" /> LinkedIn
              </a>
            )}
            {professional.website_url && (
              <a href={professional.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-dna-emerald underline">
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
          </div>
        </section>
      )}

      {/* Suggested Communities (demo) */}
      {suggestedCommunities && suggestedCommunities.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Suggested Communities</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {suggestedCommunities.map((c) => (
              <div key={c.id} className="border rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-600 mt-1 line-clamp-2">{c.description}</div>
                {c.category && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">{c.category}</Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default ProfessionalProfilePreview;
