export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      adin_connection_matches: {
        Row: {
          created_at: string | null
          id: string
          match_reason: string | null
          match_score: number | null
          matched_user_id: string
          shared_regions: string[] | null
          shared_sectors: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_reason?: string | null
          match_score?: number | null
          matched_user_id: string
          shared_regions?: string[] | null
          shared_sectors?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_reason?: string | null
          match_score?: number | null
          matched_user_id?: string
          shared_regions?: string[] | null
          shared_sectors?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      adin_connection_signals: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          reason: string
          score: number
          source_user: string
          target_user: string
          timestamp: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          reason: string
          score?: number
          source_user: string
          target_user: string
          timestamp?: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          reason?: string
          score?: number
          source_user?: string
          target_user?: string
          timestamp?: string
        }
        Relationships: []
      }
      adin_contributor_requests: {
        Row: {
          admin_notes: string | null
          country_focus: string
          created_at: string
          description: string
          evidence_links: string[] | null
          id: string
          impact_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          country_focus: string
          created_at?: string
          description: string
          evidence_links?: string[] | null
          id?: string
          impact_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          country_focus?: string
          created_at?: string
          description?: string
          evidence_links?: string[] | null
          id?: string
          impact_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      adin_profiles: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          display_name: string | null
          id: string
          influence_score: number | null
          last_updated: string | null
          prompted_by_event: string | null
          region_focus: string[] | null
          sector_focus: string[] | null
          tags: Json | null
          verified: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          influence_score?: number | null
          last_updated?: string | null
          prompted_by_event?: string | null
          region_focus?: string[] | null
          sector_focus?: string[] | null
          tags?: Json | null
          verified?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          influence_score?: number | null
          last_updated?: string | null
          prompted_by_event?: string | null
          region_focus?: string[] | null
          sector_focus?: string[] | null
          tags?: Json | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "adin_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      adin_signals: {
        Row: {
          created_at: string | null
          created_by: string | null
          cta: string | null
          description: string | null
          id: string
          link: string | null
          region_focus: string[] | null
          sector_focus: string[] | null
          seen: boolean | null
          signal_data: Json | null
          signal_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cta?: string | null
          description?: string | null
          id?: string
          link?: string | null
          region_focus?: string[] | null
          sector_focus?: string[] | null
          seen?: boolean | null
          signal_data?: Json | null
          signal_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cta?: string | null
          description?: string | null
          id?: string
          link?: string | null
          region_focus?: string[] | null
          sector_focus?: string[] | null
          seen?: boolean | null
          signal_data?: Json | null
          signal_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adin_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_analytics: {
        Row: {
          action_type: string
          admin_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_analytics_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          status: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          status?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          status?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          related_resource_id: string | null
          related_resource_type: string | null
          severity: string | null
          title: string
          type: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          related_resource_id?: string | null
          related_resource_type?: string | null
          severity?: string | null
          title: string
          type: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          related_resource_id?: string | null
          related_resource_type?: string | null
          severity?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      beta_applications: {
        Row: {
          admin_notes: string | null
          beta_phase: string
          company: string | null
          created_at: string | null
          email: string
          experience: string | null
          id: string
          magic_link_expires_at: string | null
          magic_link_token: string | null
          motivation: string | null
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          role: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          beta_phase: string
          company?: string | null
          created_at?: string | null
          email: string
          experience?: string | null
          id?: string
          magic_link_expires_at?: string | null
          magic_link_token?: string | null
          motivation?: string | null
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          beta_phase?: string
          company?: string | null
          created_at?: string | null
          email?: string
          experience?: string | null
          id?: string
          magic_link_expires_at?: string | null
          magic_link_token?: string | null
          motivation?: string | null
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      beta_feedback: {
        Row: {
          created_at: string | null
          feature_name: string
          feedback_text: string | null
          feedback_type: string
          id: string
          metadata: Json | null
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          feedback_text?: string | null
          feedback_type: string
          id?: string
          metadata?: Json | null
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          feedback_text?: string | null
          feedback_type?: string
          id?: string
          metadata?: Json | null
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beta_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_analytics: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "growth_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_seeded: boolean | null
          parent_id: string | null
          post_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_seeded?: boolean | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_seeded?: boolean | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean | null
          member_count: number | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string | null
          moderator_notes: string | null
          name: string
          purpose_goals: string | null
          rejection_reason: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean | null
          member_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          moderator_notes?: string | null
          name: string
          purpose_goals?: string | null
          rejection_reason?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean | null
          member_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          moderator_notes?: string | null
          name?: string
          purpose_goals?: string | null
          rejection_reason?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_event_attendees: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          community_id: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          event_date: string
          id: string
          image_url: string | null
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          registration_required: boolean | null
          registration_url: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          registration_required?: boolean | null
          registration_url?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          registration_required?: boolean | null
          registration_url?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          community_id: string
          id: string
          joined_at: string
          requested_at: string | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          community_id: string
          id?: string
          joined_at?: string
          requested_at?: string | null
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          community_id?: string
          id?: string
          joined_at?: string
          requested_at?: string | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          community_id: string
          content: string
          created_at: string
          event_date: string | null
          event_location: string | null
          id: string
          is_pinned: boolean | null
          media_url: string | null
          post_type: string
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          community_id: string
          content: string
          created_at?: string
          event_date?: string | null
          event_location?: string | null
          id?: string
          is_pinned?: boolean | null
          media_url?: string | null
          post_type?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          community_id?: string
          content?: string
          created_at?: string
          event_date?: string | null
          event_location?: string | null
          id?: string
          is_pinned?: boolean | null
          media_url?: string | null
          post_type?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          purpose: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          purpose: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          purpose?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_flags: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          flagged_by: string | null
          id: string
          moderator_notes: string | null
          reason: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          flagged_by?: string | null
          id?: string
          moderator_notes?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          flagged_by?: string | null
          id?: string
          moderator_notes?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_flags_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_moderation: {
        Row: {
          action: string
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          moderator_id: string | null
          reason: string | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          action: string
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          moderator_id?: string | null
          reason?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          action?: string
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          moderator_id?: string | null
          reason?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contribution_cards: {
        Row: {
          amount_needed: number | null
          amount_raised: number | null
          contribution_type: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          impact_area: string | null
          location: string | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount_needed?: number | null
          amount_raised?: number | null
          contribution_type: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          impact_area?: string | null
          location?: string | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount_needed?: number | null
          amount_raised?: number | null
          contribution_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          impact_area?: string | null
          location?: string | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contribution_cards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          target_id: string
          target_title: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id: string
          target_title?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string
          target_title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          updated_at: string
          user_1_id: string
          user_2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
          user_1_id: string
          user_2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
          user_1_id?: string
          user_2_id?: string
        }
        Relationships: []
      }
      embed_providers: {
        Row: {
          endpoint_url: string
          id: number
          provider_name: string
        }
        Insert: {
          endpoint_url: string
          id?: number
          provider_name: string
        }
        Update: {
          endpoint_url?: string
          id?: number
          provider_name?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          component_stack: string | null
          created_at: string
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          metadata: Json | null
          severity: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_stack?: string | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          metadata?: Json | null
          severity?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_stack?: string | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          metadata?: Json | null
          severity?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          cancelled_at: string | null
          event_id: string
          id: string
          notes: string | null
          registered_at: string
          status: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          registered_at?: string
          status?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          registered_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number | null
          banner_url: string | null
          created_at: string
          created_by: string
          date_time: string | null
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          registration_url: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          attendee_count?: number | null
          banner_url?: string | null
          created_at?: string
          created_by?: string
          date_time?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          registration_url?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          attendee_count?: number | null
          banner_url?: string | null
          created_at?: string
          created_by?: string
          date_time?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          registration_url?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          feature_key: string
          is_enabled: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          feature_key: string
          is_enabled?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          feature_key?: string
          is_enabled?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          ip_address: unknown
          submission_type: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address: unknown
          submission_type: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: unknown
          submission_type?: string
        }
        Relationships: []
      }
      group_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_ids: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_ids: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_ids?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          read_by: string[] | null
          sender_id: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          read_by?: string[] | null
          sender_id?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          read_by?: string[] | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "group_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_campaigns: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metrics: Json | null
          name: string
          scheduled_at: string | null
          status: string
          target_segment: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metrics?: Json | null
          name: string
          scheduled_at?: string | null
          status?: string
          target_segment?: Json | null
          type?: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          scheduled_at?: string | null
          status?: string
          target_segment?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      impact_log: {
        Row: {
          action_type: string | null
          context: Json | null
          created_at: string | null
          id: string
          metadata: Json | null
          pillar: string | null
          points: number | null
          score: number | null
          target_id: string | null
          target_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          action_type?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          pillar?: string | null
          points?: number | null
          score?: number | null
          target_id?: string | null
          target_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          action_type?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          pillar?: string | null
          points?: number | null
          score?: number | null
          target_id?: string | null
          target_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      initiatives: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          impact_area: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          impact_area?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          impact_area?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          service_name: string
          token_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          service_name: string
          token_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          service_name?: string
          token_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          referral_code: string | null
          role: string | null
          used_at: string | null
          used_by_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          referral_code?: string | null
          role?: string | null
          used_at?: string | null
          used_by_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          referral_code?: string | null
          role?: string | null
          used_at?: string | null
          used_by_id?: string | null
        }
        Relationships: []
      }
      launch_config: {
        Row: {
          current_invites: number | null
          id: string
          launch_date: string | null
          launch_mode: string
          max_invites: number | null
          updated_at: string | null
        }
        Insert: {
          current_invites?: number | null
          id?: string
          launch_date?: string | null
          launch_mode?: string
          max_invites?: number | null
          updated_at?: string | null
        }
        Update: {
          current_invites?: number | null
          id?: string
          launch_date?: string | null
          launch_mode?: string
          max_invites?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leaderboard_cache: {
        Row: {
          country: string | null
          id: string
          leaderboard_type: string
          rank: number
          score: number
          sector: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country?: string | null
          id?: string
          leaderboard_type: string
          rank: number
          score: number
          sector?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string | null
          id?: string
          leaderboard_type?: string
          rank?: number
          score?: number
          sector?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          read_by: string[] | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_by?: string[] | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_by?: string[] | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          preferences: Json | null
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          preferences?: Json | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          preferences?: Json | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_feedback: {
        Row: {
          created_at: string
          emoji_feedback: string | null
          feedback_text: string | null
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji_feedback?: string | null
          feedback_text?: string | null
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          emoji_feedback?: string | null
          feedback_text?: string | null
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      phase_metrics: {
        Row: {
          color: string | null
          icon: string | null
          id: string
          label: string
          phase_slug: string
          target: string | null
          updated_at: string
          value: string
        }
        Insert: {
          color?: string | null
          icon?: string | null
          id?: string
          label: string
          phase_slug: string
          target?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          color?: string | null
          icon?: string | null
          id?: string
          label?: string
          phase_slug?: string
          target?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          is_seeded: boolean | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_seeded?: boolean | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_seeded?: boolean | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string | null
          created_at: string | null
          embed_metadata: Json | null
          hashtags: string[] | null
          id: string
          media_url: string | null
          pillar: string
          shared_post_id: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          author_id: string
          content?: string | null
          created_at?: string | null
          embed_metadata?: Json | null
          hashtags?: string[] | null
          id?: string
          media_url?: string | null
          pillar: string
          shared_post_id?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          author_id?: string
          content?: string | null
          created_at?: string | null
          embed_metadata?: Json | null
          hashtags?: string[] | null
          id?: string
          media_url?: string | null
          pillar?: string
          shared_post_id?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_shared_post_id_fkey"
            columns: ["shared_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          ip_address: unknown | null
          profile_id: string
          user_agent: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          profile_id: string
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          profile_id?: string
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_visibility: string | null
          adin_prompt_status: string | null
          advocacy_interests: string[] | null
          agrees_to_values: boolean | null
          available_for: string[] | null
          avatar_url: string | null
          banner_url: string | null
          beta_expires_at: string | null
          beta_features_tested: string[] | null
          beta_feedback_count: number | null
          beta_phase: string | null
          beta_signup_data: Json | null
          beta_status: string | null
          bio: string | null
          collaboration_needs: string[] | null
          company: string | null
          contribution_style: string | null
          country_of_origin: string | null
          country_origin: string | null
          created_at: string
          current_country: string | null
          current_location: string | null
          diaspora_origin: string | null
          display_name: string | null
          email: string | null
          email_notifications: boolean | null
          first_action_completed: boolean | null
          first_action_type: string | null
          full_name: string | null
          fundraising_status: string | null
          headline: string | null
          id: string
          impact_areas: string[] | null
          impact_goals: string[] | null
          industry: string | null
          interest_tags: string[] | null
          interests: string[] | null
          intro_audio_url: string | null
          intro_text: string | null
          intro_video_url: string | null
          is_beta_tester: boolean | null
          is_public: boolean | null
          last_seen_at: string | null
          linkedin_url: string | null
          location: string | null
          mentorship_interest: string[] | null
          newsletter_emails: boolean | null
          notification_preferences: Json | null
          onboarding_completed_at: string | null
          onboarding_recommendations_viewed: boolean | null
          onboarding_stage: string | null
          profession: string | null
          professional_role: string | null
          profile_completeness_score: number | null
          profile_picture_url: string | null
          recent_searches: string[] | null
          referral_code: string | null
          referrer_id: string | null
          role: string | null
          sectors: string[] | null
          selected_pillars: string[] | null
          skills: string[] | null
          support_areas: string[] | null
          twitter_url: string | null
          updated_at: string
          user_type: string | null
          username: string | null
          username_changes: number | null
          username_changes_left: number | null
          venture_name: string | null
          venture_stage: string | null
          website_url: string | null
          what_to_give: string[] | null
          what_to_receive: string[] | null
          years_experience: number | null
        }
        Insert: {
          account_visibility?: string | null
          adin_prompt_status?: string | null
          advocacy_interests?: string[] | null
          agrees_to_values?: boolean | null
          available_for?: string[] | null
          avatar_url?: string | null
          banner_url?: string | null
          beta_expires_at?: string | null
          beta_features_tested?: string[] | null
          beta_feedback_count?: number | null
          beta_phase?: string | null
          beta_signup_data?: Json | null
          beta_status?: string | null
          bio?: string | null
          collaboration_needs?: string[] | null
          company?: string | null
          contribution_style?: string | null
          country_of_origin?: string | null
          country_origin?: string | null
          created_at?: string
          current_country?: string | null
          current_location?: string | null
          diaspora_origin?: string | null
          display_name?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_action_completed?: boolean | null
          first_action_type?: string | null
          full_name?: string | null
          fundraising_status?: string | null
          headline?: string | null
          id: string
          impact_areas?: string[] | null
          impact_goals?: string[] | null
          industry?: string | null
          interest_tags?: string[] | null
          interests?: string[] | null
          intro_audio_url?: string | null
          intro_text?: string | null
          intro_video_url?: string | null
          is_beta_tester?: boolean | null
          is_public?: boolean | null
          last_seen_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          mentorship_interest?: string[] | null
          newsletter_emails?: boolean | null
          notification_preferences?: Json | null
          onboarding_completed_at?: string | null
          onboarding_recommendations_viewed?: boolean | null
          onboarding_stage?: string | null
          profession?: string | null
          professional_role?: string | null
          profile_completeness_score?: number | null
          profile_picture_url?: string | null
          recent_searches?: string[] | null
          referral_code?: string | null
          referrer_id?: string | null
          role?: string | null
          sectors?: string[] | null
          selected_pillars?: string[] | null
          skills?: string[] | null
          support_areas?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          username_changes?: number | null
          username_changes_left?: number | null
          venture_name?: string | null
          venture_stage?: string | null
          website_url?: string | null
          what_to_give?: string[] | null
          what_to_receive?: string[] | null
          years_experience?: number | null
        }
        Update: {
          account_visibility?: string | null
          adin_prompt_status?: string | null
          advocacy_interests?: string[] | null
          agrees_to_values?: boolean | null
          available_for?: string[] | null
          avatar_url?: string | null
          banner_url?: string | null
          beta_expires_at?: string | null
          beta_features_tested?: string[] | null
          beta_feedback_count?: number | null
          beta_phase?: string | null
          beta_signup_data?: Json | null
          beta_status?: string | null
          bio?: string | null
          collaboration_needs?: string[] | null
          company?: string | null
          contribution_style?: string | null
          country_of_origin?: string | null
          country_origin?: string | null
          created_at?: string
          current_country?: string | null
          current_location?: string | null
          diaspora_origin?: string | null
          display_name?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_action_completed?: boolean | null
          first_action_type?: string | null
          full_name?: string | null
          fundraising_status?: string | null
          headline?: string | null
          id?: string
          impact_areas?: string[] | null
          impact_goals?: string[] | null
          industry?: string | null
          interest_tags?: string[] | null
          interests?: string[] | null
          intro_audio_url?: string | null
          intro_text?: string | null
          intro_video_url?: string | null
          is_beta_tester?: boolean | null
          is_public?: boolean | null
          last_seen_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          mentorship_interest?: string[] | null
          newsletter_emails?: boolean | null
          notification_preferences?: Json | null
          onboarding_completed_at?: string | null
          onboarding_recommendations_viewed?: boolean | null
          onboarding_stage?: string | null
          profession?: string | null
          professional_role?: string | null
          profile_completeness_score?: number | null
          profile_picture_url?: string | null
          recent_searches?: string[] | null
          referral_code?: string | null
          referrer_id?: string | null
          role?: string | null
          sectors?: string[] | null
          selected_pillars?: string[] | null
          skills?: string[] | null
          support_areas?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          username_changes?: number | null
          username_changes_left?: number | null
          venture_name?: string | null
          venture_stage?: string | null
          website_url?: string | null
          what_to_give?: string[] | null
          what_to_receive?: string[] | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          impact_area: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          impact_area?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          impact_area?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_email: string
          referrer_id: string
          updated_at: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_email: string
          referrer_id: string
          updated_at?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_email?: string
          referrer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reminder_logs: {
        Row: {
          cohort: string | null
          delivery_channel: string | null
          id: string
          message_template: string | null
          metadata: Json | null
          reminder_type: string
          scheduled_at: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          cohort?: string | null
          delivery_channel?: string | null
          id?: string
          message_template?: string | null
          metadata?: Json | null
          reminder_type: string
          scheduled_at: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          cohort?: string | null
          delivery_channel?: string | null
          id?: string
          message_template?: string | null
          metadata?: Json | null
          reminder_type?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          name: string | null
          query: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          name?: string | null
          query: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          name?: string | null
          query?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          clicked_results: Json | null
          created_at: string
          filters_used: Json | null
          id: string
          query: string
          result_count: number | null
          search_duration_ms: number | null
          user_id: string | null
        }
        Insert: {
          clicked_results?: Json | null
          created_at?: string
          filters_used?: Json | null
          id?: string
          query: string
          result_count?: number | null
          search_duration_ms?: number | null
          user_id?: string | null
        }
        Update: {
          clicked_results?: Json | null
          created_at?: string
          filters_used?: Json | null
          id?: string
          query?: string
          result_count?: number | null
          search_duration_ms?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_adin_profile: {
        Row: {
          contributor_impact_type: string | null
          contributor_score: number | null
          contributor_verified_at: string | null
          created_at: string
          engagement_pillars: string[] | null
          id: string
          industries: string[] | null
          interests: string[] | null
          is_verified_contributor: boolean | null
          last_active: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contributor_impact_type?: string | null
          contributor_score?: number | null
          contributor_verified_at?: string | null
          created_at?: string
          engagement_pillars?: string[] | null
          id?: string
          industries?: string[] | null
          interests?: string[] | null
          is_verified_contributor?: boolean | null
          last_active?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contributor_impact_type?: string | null
          contributor_score?: number | null
          contributor_verified_at?: string | null
          created_at?: string
          engagement_pillars?: string[] | null
          id?: string
          industries?: string[] | null
          interests?: string[] | null
          is_verified_contributor?: boolean | null
          last_active?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_name: string
          badge_type: string
          description: string | null
          icon: string | null
          id: string
          metadata: Json | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_name: string
          badge_type: string
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          badge_type?: string
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_communities: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          owner_id: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          owner_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          owner_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_communities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_contributions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          region: string | null
          sector: string | null
          target_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          region?: string | null
          sector?: string | null
          target_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          region?: string | null
          sector?: string | null
          target_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dna_points: {
        Row: {
          collaborate_score: number
          connect_score: number
          contribute_score: number
          created_at: string
          last_updated: string
          total_score: number | null
          user_id: string
        }
        Insert: {
          collaborate_score?: number
          connect_score?: number
          contribute_score?: number
          created_at?: string
          last_updated?: string
          total_score?: number | null
          user_id: string
        }
        Update: {
          collaborate_score?: number
          connect_score?: number
          contribute_score?: number
          created_at?: string
          last_updated?: string
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_engagement_tracking: {
        Row: {
          cohort: string | null
          created_at: string
          event_context: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          cohort?: string | null
          created_at?: string
          event_context?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          cohort?: string | null
          created_at?: string
          event_context?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_onboarding_selections: {
        Row: {
          created_at: string | null
          id: string
          selected_at: string | null
          selection_type: string
          target_id: string
          target_title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          selected_at?: string | null
          selection_type: string
          target_id: string
          target_title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          selected_at?: string | null
          selection_type?: string
          target_id?: string
          target_title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_selections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recommendations: {
        Row: {
          created_at: string | null
          id: string
          match_reasons: string[] | null
          match_score: number | null
          recommendation_type: string
          status: string | null
          target_description: string | null
          target_id: string
          target_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_reasons?: string[] | null
          match_score?: number | null
          recommendation_type: string
          status?: string | null
          target_description?: string | null
          target_id: string
          target_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_reasons?: string[] | null
          match_score?: number | null
          recommendation_type?: string
          status?: string | null
          target_description?: string | null
          target_id?: string
          target_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          causes: string[] | null
          created_at: string | null
          diaspora_tags: string[] | null
          email: string | null
          full_name: string | null
          id: string
          languages: string[] | null
          location: string | null
          origin_country: string | null
          role: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          causes?: string[] | null
          created_at?: string | null
          diaspora_tags?: string[] | null
          email?: string | null
          full_name?: string | null
          id: string
          languages?: string[] | null
          location?: string | null
          origin_country?: string | null
          role: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          causes?: string[] | null
          created_at?: string | null
          diaspora_tags?: string[] | null
          email?: string | null
          full_name?: string | null
          id?: string
          languages?: string[] | null
          location?: string | null
          origin_country?: string | null
          role?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      verified_contributors: {
        Row: {
          expires_at: string | null
          id: string
          notes: string | null
          user_id: string | null
          verification_source: string
          verified_at: string | null
        }
        Insert: {
          expires_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
          verification_source: string
          verified_at?: string | null
        }
        Update: {
          expires_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
          verification_source?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verified_contributors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          causes: string[] | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          location: string | null
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          causes?: string[] | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          location?: string | null
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          causes?: string[] | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          location?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_impact_summary: {
        Row: {
          collaborate_actions: number | null
          comments_made: number | null
          connect_actions: number | null
          connections_made: number | null
          contribute_actions: number | null
          last_activity: string | null
          posts_created: number | null
          reactions_given: number | null
          total_actions: number | null
          total_points: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_message_reaction: {
        Args: { p_message_id: string; p_user_id: string; p_reaction: string }
        Returns: undefined
      }
      approve_beta_application: {
        Args: { application_id: string; admin_id: string }
        Returns: {
          magic_link_token: string
          expires_at: string
        }[]
      }
      calculate_impact_score: {
        Args: { target_user_id: string }
        Returns: number
      }
      calculate_match_score: {
        Args:
          | { profile_id: string; signal_id: string }
          | {
              user1_regions: string[]
              user1_sectors: string[]
              user2_regions: string[]
              user2_sectors: string[]
            }
        Returns: number
      }
      calculate_profile_completeness: {
        Args: { target_user_id: string }
        Returns: number
      }
      calculate_profile_completeness_score_new: {
        Args: { p_id: string }
        Returns: number
      }
      check_badge_unlocks: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      check_rate_limit: {
        Args: {
          _ip_address: unknown
          _submission_type: string
          _max_submissions?: number
          _time_window_minutes?: number
        }
        Returns: boolean
      }
      compute_influence_score: {
        Args: { target_user_id: string }
        Returns: number
      }
      create_admin_notification: {
        Args: {
          p_admin_id: string
          p_type: string
          p_title: string
          p_message: string
          p_severity?: string
          p_related_resource_type?: string
          p_related_resource_id?: string
        }
        Returns: string
      }
      create_audit_log: {
        Args: {
          p_admin_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
          p_status?: string
        }
        Returns: string
      }
      enqueue_reminders_for_all_users: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      find_adin_matches: {
        Args:
          | { target_user_id: string }
          | { user_id: string; match_threshold?: number }
        Returns: {
          matched_user_id: string
          match_score: number
          match_reason: string
          shared_regions: string[]
          shared_sectors: string[]
        }[]
      }
      generate_magic_link_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_username_from_name: {
        Args: { full_name: string }
        Returns: string
      }
      get_active_users_this_week: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_admin_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          is_public: boolean
        }[]
      }
      get_engagement_rate: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_leaderboard: {
        Args: {
          board_type?: string
          country_filter?: string
          sector_filter?: string
          limit_count?: number
        }
        Returns: {
          user_id: string
          full_name: string
          avatar_url: string
          score: number
          rank: number
          location: string
        }[]
      }
      get_message_reactions: {
        Args: { p_message_ids: string[] }
        Returns: {
          id: string
          message_id: string
          user_id: string
          reaction: string
          created_at: string
        }[]
      }
      get_newsletter_followers: {
        Args: { newsletter_user_id: string }
        Returns: {
          user_id: string
          email: string
          full_name: string
        }[]
      }
      get_pending_reminders: {
        Args: { batch_size?: number }
        Returns: {
          reminder_id: string
          user_id: string
          user_email: string
          reminder_type: string
          cohort: string
          metadata: Json
        }[]
      }
      get_total_connections: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_total_events: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_total_posts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_total_users: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_cohort: {
        Args: { target_user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_verification_status: {
        Args: { target_user_id: string }
        Returns: Json
      }
      handle_referral_signup: {
        Args: { new_user_id: string; referral_code_param: string }
        Returns: undefined
      }
      is_admin_user: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_engagement_event: {
        Args: {
          target_user_id: string
          event_type_param: string
          event_context_param?: Json
          cohort_param?: string
        }
        Returns: string
      }
      make_user_admin: {
        Args: { user_email: string }
        Returns: string
      }
      remove_message_reaction: {
        Args: { p_message_id: string; p_user_id: string; p_reaction: string }
        Returns: undefined
      }
      reset_seeded_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      trigger_adin_prompt: {
        Args: { target_user_id: string; event_type: string }
        Returns: undefined
      }
      update_adin_last_active: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_all_influence_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_dna_points: {
        Args: { target_user_id: string; pillar: string; points?: number }
        Returns: undefined
      }
      update_reminder_status: {
        Args: {
          reminder_id: string
          new_status: string
          error_message?: string
        }
        Returns: boolean
      }
      update_username: {
        Args: { new_username: string }
        Returns: undefined
      }
    }
    Enums: {
      admin_role: "admin" | "superadmin" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["admin", "superadmin", "moderator"],
    },
  },
} as const
