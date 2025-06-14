
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users as UsersIcon, Image as ImageIcon } from "lucide-react";
import { Event } from "@/types/search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onRegister: () => void;
  isLoggedIn: boolean;
};

const PLACEHOLDER_BANNER =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=900&q=80";
const PLACEHOLDER_PROFILE =
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?fit=crop&w=128&q=80";

export default function EventDetailDialog({
  open,
  onOpenChange,
  event,
  onRegister,
  isLoggedIn
}: Props) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full p-0 rounded-2xl overflow-hidden sm:max-w-2xl shadow-xl">
        {/* Banner */}
        <div className="relative w-full h-40 sm:h-56 bg-gray-100">
          <img
            src={event.banner_url || PLACEHOLDER_BANNER}
            alt={`${event.title} banner`}
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
          {/* Profile image avatar - absolute, overlap banner bottom left */}
          <div className="absolute left-5 -bottom-10 z-10">
            <Avatar className="w-20 h-20 ring-4 ring-white shadow-xl bg-white">
              <AvatarImage
                src={event.image_url || PLACEHOLDER_PROFILE}
                alt={event.title}
                className="object-cover"
              />
              <AvatarFallback className="bg-dna-copper text-white">
                <ImageIcon className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        {/* Card content, padding top to allow for avatar overlap */}
        <div className="pt-14 px-5 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-bold text-xl mb-1 text-dna-forest">{event.title}</h2>
              <div className="flex gap-2 flex-wrap mb-2">
                <Badge variant="outline">{event.type}</Badge>
                {event.is_virtual && (
                  <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>
                )}
              </div>
            </div>
            {/* Date & Time */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {event.date_time
                  ? new Date(event.date_time).toLocaleString()
                  : "TBD"}
              </span>
            </div>
          </div>
          {/* Location, Attendees */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3 mb-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
            <div className="flex items-center gap-1">
              <UsersIcon className="w-4 h-4" />
              {event.attendee_count ?? 0} attending
            </div>
          </div>
          {/* Description */}
          {event.description && (
            <div className="my-4 text-gray-800 text-base leading-relaxed whitespace-pre-line break-words">
              {event.description}
            </div>
          )}
          <DialogFooter>
            <Button
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
              onClick={onRegister}
            >
              Register for this Event
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
