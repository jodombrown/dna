
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Award, MapPin, Globe, Briefcase } from "lucide-react";

const ProfileHeroSection = ({ profile, isOwnProfile, onEdit }: any) => (
  <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper p-8 md:p-12 mb-6 flex flex-col md:flex-row items-center gap-8">
    <div className="flex-shrink-0 flex flex-col items-center md:items-start text-center md:text-left">
      <div className="relative mb-3">
        <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white/20 shadow-lg">
          <Avatar className="w-full h-full rounded-none">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} className="object-cover" />
            <AvatarFallback className="bg-white/20 text-white text-3xl font-bold rounded-none">
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        {profile?.is_verified && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-dna-gold rounded-full flex items-center justify-center shadow">
            <Award className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{profile?.full_name}</h1>
      <p className="text-xl text-white/90 mb-1">{profile?.profession}</p>
      {profile?.company && (
        <div className="flex items-center gap-2 text-white/80 mb-2">
          <Briefcase className="w-4 h-4" />
          <span>{profile.company}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {profile?.location && (
          <div className="flex items-center gap-1 text-white/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{profile.location}</span>
          </div>
        )}
        {profile?.country_of_origin && (
          <div className="flex items-center gap-1 text-white/80">
            <Globe className="w-4 h-4" />
            <span className="text-sm">{profile.country_of_origin}</span>
          </div>
        )}
      </div>
    </div>
    <div className="ml-auto md:ml-0 flex flex-col items-center md:items-end justify-end">
      {isOwnProfile && onEdit && (
        <Button
          onClick={onEdit}
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 mb-6"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      )}
    </div>
  </section>
);
export default ProfileHeroSection;
