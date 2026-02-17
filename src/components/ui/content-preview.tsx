import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import { Calendar, Users, MapPin, Briefcase } from "lucide-react"

/**
 * DNA ContentPreview — Composite Component (Design System PRD Phase 4)
 *
 * A compact preview card for embedding linked content within feed cards,
 * profiles, or messages. Supports event, space, and opportunity types.
 *
 * Usage:
 *   <ContentPreview
 *     type="event"
 *     title="Diaspora Investor Summit"
 *     subtitle="March 15, 2026 · Accra, Ghana"
 *     imageUrl="/images/summit.jpg"
 *     badge="Hybrid"
 *     onClick={() => navigate(`/events/${eventId}`)}
 *   />
 */

type ContentType = "event" | "space" | "opportunity" | "story" | "generic"

const typeIconMap: Record<ContentType, React.ReactNode> = {
  event: <Calendar className="h-4 w-4" />,
  space: <Users className="h-4 w-4" />,
  opportunity: <Briefcase className="h-4 w-4" />,
  story: null,
  generic: null,
}

const typeBadgeVariant: Record<ContentType, "convene" | "collaborate" | "contribute" | "convey" | "default"> = {
  event: "convene",
  space: "collaborate",
  opportunity: "contribute",
  story: "convey",
  generic: "default",
}

interface ContentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content type — determines icon and badge color */
  type: ContentType
  /** Title text */
  title: string
  /** Subtitle / description */
  subtitle?: string
  /** Optional image */
  imageUrl?: string
  /** Badge text (e.g. "Virtual", "Open", "Featured") */
  badge?: string
  /** Location text */
  location?: string
  /** Interactive */
  interactive?: boolean
}

const ContentPreview = React.forwardRef<HTMLDivElement, ContentPreviewProps>(
  (
    {
      type,
      title,
      subtitle,
      imageUrl,
      badge,
      location,
      interactive = true,
      className,
      ...props
    },
    ref
  ) => {
    const icon = typeIconMap[type]

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 rounded-dna-md border border-dna-stone bg-dna-cream/50 p-3",
          interactive && "cursor-pointer hover:bg-dna-sand/60 transition-colors",
          className
        )}
        {...props}
      >
        {/* Thumbnail */}
        {imageUrl && (
          <div className="shrink-0 w-16 h-16 rounded-dna-sm overflow-hidden bg-dna-sand">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div className="flex items-center gap-1.5">
            {icon && (
              <span className="text-muted-foreground shrink-0">{icon}</span>
            )}
            <span className="text-[14px] font-semibold text-foreground truncate">
              {title}
            </span>
          </div>

          {subtitle && (
            <p className="text-[12px] text-muted-foreground truncate">
              {subtitle}
            </p>
          )}

          {location && (
            <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {badge && (
            <div className="mt-0.5">
              <Badge variant={typeBadgeVariant[type]} className="text-[10px] px-1.5 py-0">
                {badge}
              </Badge>
            </div>
          )}
        </div>
      </div>
    )
  }
)
ContentPreview.displayName = "ContentPreview"

export { ContentPreview }
export type { ContentPreviewProps, ContentType }
