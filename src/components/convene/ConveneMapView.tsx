/**
 * DNA | CONVENE — Map View
 * LAZY LOADED via React.lazy(). Shows events on an interactive Leaflet map.
 * Default export required for React.lazy() compatibility.
 */

import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { LatLngBounds, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ConveneEventPin, type MapEventData } from './ConveneEventPin';
import { useNavigate } from 'react-router-dom';

interface ConveneMapViewProps {
  events: MapEventData[];
  selectedCity: string | null;
  onEventSelect: (eventId: string) => void;
}

// Default center: Africa
const DEFAULT_CENTER: LatLngTuple = [0, 20];
const DEFAULT_ZOOM = 3;

function ConveneMapView({ events, selectedCity, onEventSelect }: ConveneMapViewProps) {
  const navigate = useNavigate();

  // Filter to events with coordinates only
  const mappableEvents = useMemo(
    () => events.filter((e) => e.location_lat != null && e.location_lng != null),
    [events]
  );

  // Compute map bounds to fit all visible events
  const { center, zoom } = useMemo(() => {
    if (mappableEvents.length === 0) {
      return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
    }

    if (mappableEvents.length === 1) {
      return {
        center: [mappableEvents[0].location_lat, mappableEvents[0].location_lng] as LatLngTuple,
        zoom: 13,
      };
    }

    const bounds = new LatLngBounds(
      mappableEvents.map((e) => [e.location_lat, e.location_lng] as LatLngTuple)
    );
    return {
      center: [bounds.getCenter().lat, bounds.getCenter().lng] as LatLngTuple,
      zoom: DEFAULT_ZOOM,
    };
  }, [mappableEvents]);

  const handleEventClick = (eventId: string) => {
    onEventSelect(eventId);
    const event = mappableEvents.find((e) => e.id === eventId);
    if (event) {
      navigate(`/dna/convene/events/${event.slug || event.id}`);
    }
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full z-0"
        scrollWheelZoom
        zoomControl
        bounds={
          mappableEvents.length > 1
            ? new LatLngBounds(
                mappableEvents.map((e) => [e.location_lat, e.location_lng] as LatLngTuple)
              )
            : undefined
        }
        boundsOptions={{ padding: [50, 50] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mappableEvents.map((event) => (
          <ConveneEventPin
            key={event.id}
            event={event}
            onClick={handleEventClick}
          />
        ))}
      </MapContainer>

      {/* Event count overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-border">
        <span className="text-xs font-medium text-foreground">
          {mappableEvents.length} event{mappableEvents.length !== 1 ? 's' : ''} on map
          {selectedCity && (
            <span className="text-muted-foreground"> in {selectedCity}</span>
          )}
        </span>
      </div>
    </div>
  );
}

export default ConveneMapView;
