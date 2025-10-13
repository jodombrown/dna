export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
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
      adin_nudges: {
        Row: {
          connection_id: string
          created_at: string
          id: string
          message: string
          nudge_type: string
          payload: Json | null
          resolved_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          id?: string
          message: string
          nudge_type: string
          payload?: Json | null
          resolved_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          id?: string
          message?: string
          nudge_type?: string
          payload?: Json | null
          resolved_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adin_nudges_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
        ]
      }
      adin_recommendations: {
        Row: {
          created_at: string
          expires_at: string | null
          for_connection_id: string | null
          id: string
          payload: Json | null
          rec_type: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          for_connection_id?: string | null
          id?: string
          payload?: Json | null
          rec_type: string
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          for_connection_id?: string | null
          id?: string
          payload?: Json | null
          rec_type?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adin_recommendations_for_connection_id_fkey"
            columns: ["for_connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
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
      applications: {
        Row: {
          applied_at: string
          cover_letter: string
          id: string
          opportunity_id: string
          resume_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          cover_letter: string
          id?: string
          opportunity_id: string
          resume_url?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string
          id?: string
          opportunity_id?: string
          resume_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_transactions: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          organization_id: string
          status: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      causes: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      collaboration_memberships: {
        Row: {
          id: string
          joined_at: string
          role: string
          space_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          space_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          space_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      collaboration_spaces: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
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
      connection_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          receiver_id: string
          sender_id: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          a: string
          adin_health: number
          adin_health_reason: string | null
          b: string
          connection_note: string | null
          created_at: string
          id: string
          last_interaction_at: string | null
          status: string
        }
        Insert: {
          a: string
          adin_health?: number
          adin_health_reason?: string | null
          b: string
          connection_note?: string | null
          created_at?: string
          id?: string
          last_interaction_at?: string | null
          status: string
        }
        Update: {
          a?: string
          adin_health?: number
          adin_health_reason?: string | null
          b?: string
          connection_note?: string | null
          created_at?: string
          id?: string
          last_interaction_at?: string | null
          status?: string
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
      continents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
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
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          capital: string | null
          created_at: string
          description: string | null
          flag_url: string | null
          id: string
          iso_code: string | null
          name: string
          population: number | null
          region_id: string
          updated_at: string
        }
        Insert: {
          capital?: string | null
          created_at?: string
          description?: string | null
          flag_url?: string | null
          id?: string
          iso_code?: string | null
          name: string
          population?: number | null
          region_id: string
          updated_at?: string
        }
        Update: {
          capital?: string | null
          created_at?: string
          description?: string | null
          flag_url?: string | null
          id?: string
          iso_code?: string | null
          name?: string
          population?: number | null
          region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "countries_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      diaspora_data: {
        Row: {
          country_id: string | null
          created_at: string
          currency: string | null
          diaspora_location: string | null
          diaspora_name: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          project_name: string | null
          project_type: string | null
          remittance_value: number | null
          story_content: string | null
          story_title: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          country_id?: string | null
          created_at?: string
          currency?: string | null
          diaspora_location?: string | null
          diaspora_name?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          project_name?: string | null
          project_type?: string | null
          remittance_value?: number | null
          story_content?: string | null
          story_title?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          country_id?: string | null
          created_at?: string
          currency?: string | null
          diaspora_location?: string | null
          diaspora_name?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          project_name?: string | null
          project_type?: string | null
          remittance_value?: number | null
          story_content?: string | null
          story_title?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diaspora_data_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      economic_indicators: {
        Row: {
          country_id: string | null
          created_at: string
          id: string
          indicator_type: string
          month: number | null
          province_id: string | null
          region_id: string | null
          source: string | null
          unit: string | null
          updated_at: string
          value: number
          year: number
        }
        Insert: {
          country_id?: string | null
          created_at?: string
          id?: string
          indicator_type: string
          month?: number | null
          province_id?: string | null
          region_id?: string | null
          source?: string | null
          unit?: string | null
          updated_at?: string
          value: number
          year: number
        }
        Update: {
          country_id?: string | null
          created_at?: string
          id?: string
          indicator_type?: string
          month?: number | null
          province_id?: string | null
          region_id?: string | null
          source?: string | null
          unit?: string | null
          updated_at?: string
          value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "economic_indicators_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "economic_indicators_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "economic_indicators_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
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
      event_analytics: {
        Row: {
          event_id: string | null
          happened_at: string | null
          id: string
          kind: string | null
          payload: Json | null
        }
        Insert: {
          event_id?: string | null
          happened_at?: string | null
          id?: string
          kind?: string | null
          payload?: Json | null
        }
        Update: {
          event_id?: string | null
          happened_at?: string | null
          id?: string
          kind?: string | null
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "event_analytics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_blasts: {
        Row: {
          body_markdown: string
          event_id: string | null
          id: string
          scheduled_for: string | null
          segment: Json | null
          sent_at: string | null
          subject: string
        }
        Insert: {
          body_markdown: string
          event_id?: string | null
          id?: string
          scheduled_for?: string | null
          segment?: Json | null
          sent_at?: string | null
          subject: string
        }
        Update: {
          body_markdown?: string
          event_id?: string | null
          id?: string
          scheduled_for?: string | null
          segment?: Json | null
          sent_at?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_blasts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_checkins: {
        Row: {
          by_profile_id: string | null
          checked_in_at: string | null
          id: string
          registration_id: string | null
        }
        Insert: {
          by_profile_id?: string | null
          checked_in_at?: string | null
          id?: string
          registration_id?: string | null
        }
        Update: {
          by_profile_id?: string | null
          checked_in_at?: string | null
          id?: string
          registration_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_checkins_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registration_questions: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          label: string
          options: Json | null
          position: number | null
          required: boolean | null
          type: string
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          label: string
          options?: Json | null
          position?: number | null
          required?: boolean | null
          type: string
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          label?: string
          options?: Json | null
          position?: number | null
          required?: boolean | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registration_questions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          answers: Json | null
          cancelled_at: string | null
          currency: string | null
          event_id: string
          id: string
          join_token: string | null
          notes: string | null
          price_paid_cents: number | null
          registered_at: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          ticket_type_id: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          cancelled_at?: string | null
          currency?: string | null
          event_id: string
          id?: string
          join_token?: string | null
          notes?: string | null
          price_paid_cents?: number | null
          registered_at?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          ticket_type_id?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          cancelled_at?: string | null
          currency?: string | null
          event_id?: string
          id?: string
          join_token?: string | null
          notes?: string | null
          price_paid_cents?: number | null
          registered_at?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          ticket_type_id?: string | null
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
          {
            foreignKeyName: "event_registrations_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "event_ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_ticket_holds: {
        Row: {
          created_at: string
          event_id: string | null
          expires_at: string
          id: string
          quantity: number | null
          ticket_type_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          expires_at: string
          id?: string
          quantity?: number | null
          ticket_type_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          expires_at?: string
          id?: string
          quantity?: number | null
          ticket_type_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_ticket_holds_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_ticket_holds_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "event_ticket_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_ticket_holds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_ticket_types: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string | null
          hidden: boolean | null
          id: string
          min_price_cents: number | null
          name: string
          payment_type: string
          price_cents: number | null
          require_approval: boolean | null
          sales_end: string | null
          sales_start: string | null
          suggested_price_cents: number | null
          total_tickets: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          hidden?: boolean | null
          id?: string
          min_price_cents?: number | null
          name: string
          payment_type?: string
          price_cents?: number | null
          require_approval?: boolean | null
          sales_end?: string | null
          sales_start?: string | null
          suggested_price_cents?: number | null
          total_tickets?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          hidden?: boolean | null
          id?: string
          min_price_cents?: number | null
          name?: string
          payment_type?: string
          price_cents?: number | null
          require_approval?: boolean | null
          sales_end?: string | null
          sales_start?: string | null
          suggested_price_cents?: number | null
          total_tickets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_waitlist: {
        Row: {
          created_at: string
          event_id: string
          id: string
          position: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          position: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_waitlist_event_id_fkey"
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
          calendar_id: string | null
          capacity: number | null
          created_at: string
          created_by: string
          date_time: string | null
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_virtual: boolean | null
          location: string | null
          location_json: Json | null
          max_attendees: number | null
          online_url: string | null
          registration_url: string | null
          slug: string | null
          theme: string | null
          title: string
          type: string | null
          updated_at: string
          visibility: string | null
          waitlist_enabled: boolean | null
        }
        Insert: {
          attendee_count?: number | null
          banner_url?: string | null
          calendar_id?: string | null
          capacity?: number | null
          created_at?: string
          created_by?: string
          date_time?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          location_json?: Json | null
          max_attendees?: number | null
          online_url?: string | null
          registration_url?: string | null
          slug?: string | null
          theme?: string | null
          title: string
          type?: string | null
          updated_at?: string
          visibility?: string | null
          waitlist_enabled?: boolean | null
        }
        Update: {
          attendee_count?: number | null
          banner_url?: string | null
          calendar_id?: string | null
          capacity?: number | null
          created_at?: string
          created_by?: string
          date_time?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          location_json?: Json | null
          max_attendees?: number | null
          online_url?: string | null
          registration_url?: string | null
          slug?: string | null
          theme?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          visibility?: string | null
          waitlist_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events_log: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
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
      feed_research_responses: {
        Row: {
          check_frequency: string
          concerns: Json | null
          content_to_see: Json | null
          content_to_share: Json | null
          created_at: string | null
          differentiation_idea: string | null
          dream_feature: string | null
          early_access_email: string | null
          feature_ratings: Json | null
          id: string
          post_frequency: string
          updated_at: string | null
          use_case: string | null
          user_id: string
          value_rating: string
          wants_early_access: boolean | null
        }
        Insert: {
          check_frequency: string
          concerns?: Json | null
          content_to_see?: Json | null
          content_to_share?: Json | null
          created_at?: string | null
          differentiation_idea?: string | null
          dream_feature?: string | null
          early_access_email?: string | null
          feature_ratings?: Json | null
          id?: string
          post_frequency: string
          updated_at?: string | null
          use_case?: string | null
          user_id: string
          value_rating: string
          wants_early_access?: boolean | null
        }
        Update: {
          check_frequency?: string
          concerns?: Json | null
          content_to_see?: Json | null
          content_to_share?: Json | null
          created_at?: string | null
          differentiation_idea?: string | null
          dream_feature?: string | null
          early_access_email?: string | null
          feature_ratings?: Json | null
          id?: string
          post_frequency?: string
          updated_at?: string | null
          use_case?: string | null
          user_id?: string
          value_rating?: string
          wants_early_access?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_research_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      impact_attributions: {
        Row: {
          connection_id: string
          created_at: string
          id: string
          impact_type: string | null
          metric: Json | null
          source_event_id: string | null
          verified_by: string | null
        }
        Insert: {
          connection_id: string
          created_at?: string
          id?: string
          impact_type?: string | null
          metric?: Json | null
          source_event_id?: string | null
          verified_by?: string | null
        }
        Update: {
          connection_id?: string
          created_at?: string
          id?: string
          impact_type?: string | null
          metric?: Json | null
          source_event_id?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_attributions_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_badges: {
        Row: {
          active: boolean
          badge_key: string
          created_at: string
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          badge_key: string
          created_at?: string
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          badge_key?: string
          created_at?: string
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
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
      innovation_data: {
        Row: {
          country_id: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          founded_year: number | null
          funding_amount: number | null
          funding_currency: string | null
          id: string
          logo_url: string | null
          name: string
          organization_type: string
          province_id: string | null
          sector: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          country_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          founded_year?: number | null
          funding_amount?: number | null
          funding_currency?: string | null
          id?: string
          logo_url?: string | null
          name: string
          organization_type: string
          province_id?: string | null
          sector?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          country_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          founded_year?: number | null
          funding_amount?: number | null
          funding_currency?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          organization_type?: string
          province_id?: string | null
          sector?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "innovation_data_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innovation_data_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
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
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
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
      milestones: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          space_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          space_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          space_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly_reports: {
        Row: {
          country_id: string | null
          created_at: string
          diaspora_spotlight: string | null
          economic_summary: string | null
          featured_image_url: string | null
          id: string
          innovation_highlight: string | null
          is_published: boolean | null
          political_summary: string | null
          published_at: string | null
          region_id: string | null
          report_month: number
          report_year: number
          updated_at: string
        }
        Insert: {
          country_id?: string | null
          created_at?: string
          diaspora_spotlight?: string | null
          economic_summary?: string | null
          featured_image_url?: string | null
          id?: string
          innovation_highlight?: string | null
          is_published?: boolean | null
          political_summary?: string | null
          published_at?: string | null
          region_id?: string | null
          report_month: number
          report_year: number
          updated_at?: string
        }
        Update: {
          country_id?: string | null
          created_at?: string
          diaspora_spotlight?: string | null
          economic_summary?: string | null
          featured_image_url?: string | null
          id?: string
          innovation_highlight?: string | null
          is_published?: boolean | null
          political_summary?: string | null
          published_at?: string | null
          region_id?: string | null
          report_month?: number
          report_year?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_reports_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          country_interests: string[] | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          region_interest: string | null
          subscription_type: string | null
          updated_at: string
        }
        Insert: {
          country_interests?: string[] | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          region_interest?: string | null
          subscription_type?: string | null
          updated_at?: string
        }
        Update: {
          country_interests?: string[] | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          region_interest?: string | null
          subscription_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscriptions_region_interest_fkey"
            columns: ["region_interest"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          message: string
          payload: Json | null
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message: string
          payload?: Json | null
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message?: string
          payload?: Json | null
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          link: string | null
          location: string | null
          space_id: string | null
          status: string
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          location?: string | null
          space_id?: string | null
          status?: string
          tags?: string[] | null
          title: string
          type?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          location?: string | null
          space_id?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string | null
          id: string
          opportunity_id: string
          proposed_contribution_type: Database["public"]["Enums"]["contribution_type"]
          proposed_hours_per_month: number | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
          withdrawn_at: string | null
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          opportunity_id: string
          proposed_contribution_type: Database["public"]["Enums"]["contribution_type"]
          proposed_hours_per_month?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          opportunity_id?: string
          proposed_contribution_type?: Database["public"]["Enums"]["contribution_type"]
          proposed_hours_per_month?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_bookmarks: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_bookmarks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_contributions: {
        Row: {
          application_id: string | null
          completed_at: string | null
          contribution_type: Database["public"]["Enums"]["contribution_type"]
          contributor_id: string
          created_at: string | null
          description: string | null
          hours_contributed: number | null
          id: string
          opportunity_id: string
          started_at: string | null
          updated_at: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          application_id?: string | null
          completed_at?: string | null
          contribution_type: Database["public"]["Enums"]["contribution_type"]
          contributor_id: string
          created_at?: string | null
          description?: string | null
          hours_contributed?: number | null
          id?: string
          opportunity_id: string
          started_at?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          application_id?: string | null
          completed_at?: string | null
          contribution_type?: Database["public"]["Enums"]["contribution_type"]
          contributor_id?: string
          created_at?: string | null
          description?: string | null
          hours_contributed?: number | null
          id?: string
          opportunity_id?: string
          started_at?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_contributions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "opportunity_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_contributions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_contributions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_verification_requests: {
        Row: {
          annual_budget_usd: number | null
          created_at: string | null
          description_of_work: string | null
          financial_document_url: string | null
          id: string
          organization_id: string
          proof_of_activity_url: string | null
          reference_1_email: string | null
          reference_1_name: string | null
          reference_1_relationship: string | null
          reference_2_email: string | null
          reference_2_name: string | null
          reference_2_relationship: string | null
          registration_document_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          social_media_links: string[] | null
          status: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          annual_budget_usd?: number | null
          created_at?: string | null
          description_of_work?: string | null
          financial_document_url?: string | null
          id?: string
          organization_id: string
          proof_of_activity_url?: string | null
          reference_1_email?: string | null
          reference_1_name?: string | null
          reference_1_relationship?: string | null
          reference_2_email?: string | null
          reference_2_name?: string | null
          reference_2_relationship?: string | null
          registration_document_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          social_media_links?: string[] | null
          status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          annual_budget_usd?: number | null
          created_at?: string | null
          description_of_work?: string | null
          financial_document_url?: string | null
          id?: string
          organization_id?: string
          proof_of_activity_url?: string | null
          reference_1_email?: string | null
          reference_1_name?: string | null
          reference_1_relationship?: string | null
          reference_2_email?: string | null
          reference_2_name?: string | null
          reference_2_relationship?: string | null
          registration_document_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          social_media_links?: string[] | null
          status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_verification_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          annual_budget_usd: number | null
          country_id: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          opportunities_posted_this_year: number | null
          owner_user_id: string
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
          verification_approved_at: string | null
          verification_documents_url: string | null
          verification_fee_paid: boolean | null
          verification_notes: string | null
          verification_rejected_at: string | null
          verification_status: string | null
          verification_submitted_at: string | null
          verified: boolean | null
          verified_at: string | null
          website: string | null
          year_reset_at: string | null
        }
        Insert: {
          annual_budget_usd?: number | null
          country_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          opportunities_posted_this_year?: number | null
          owner_user_id: string
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          verification_approved_at?: string | null
          verification_documents_url?: string | null
          verification_fee_paid?: boolean | null
          verification_notes?: string | null
          verification_rejected_at?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          website?: string | null
          year_reset_at?: string | null
        }
        Update: {
          annual_budget_usd?: number | null
          country_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          opportunities_posted_this_year?: number | null
          owner_user_id?: string
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          verification_approved_at?: string | null
          verification_documents_url?: string | null
          verification_fee_paid?: boolean | null
          verification_notes?: string | null
          verification_rejected_at?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          website?: string | null
          year_reset_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      political_digest: {
        Row: {
          author: string | null
          country_id: string
          created_at: string
          elections_upcoming: boolean | null
          id: string
          policy_changes: string | null
          reforms_highlight: string | null
          report_date: string
          risk_level: string | null
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          country_id: string
          created_at?: string
          elections_upcoming?: boolean | null
          id?: string
          policy_changes?: string | null
          reforms_highlight?: string | null
          report_date: string
          risk_level?: string | null
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          country_id?: string
          created_at?: string
          elections_upcoming?: boolean | null
          id?: string
          policy_changes?: string | null
          reforms_highlight?: string | null
          report_date?: string
          risk_level?: string | null
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "political_digest_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      post_analytics: {
        Row: {
          count: number
          created_at: string
          event_date: string
          event_type: string
          id: string
          metadata: Json | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          count?: number
          created_at?: string
          event_date?: string
          event_type: string
          id?: string
          metadata?: Json | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          count?: number
          created_at?: string
          event_date?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
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
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
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
        Relationships: []
      }
      post_views: {
        Row: {
          id: string
          post_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          post_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          post_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          metadata: Json | null
          post_type: string
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          post_type?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          post_type?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      profile_causes: {
        Row: {
          cause_id: string
          created_at: string | null
          profile_id: string
        }
        Insert: {
          cause_id: string
          created_at?: string | null
          profile_id: string
        }
        Update: {
          cause_id?: string
          created_at?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_causes_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_causes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_skills: {
        Row: {
          created_at: string | null
          profile_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string | null
          profile_id: string
          skill_id: string
        }
        Update: {
          created_at?: string | null
          profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          metadata: Json | null
          profile_id: string
          view_type: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          profile_id: string
          view_type?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          profile_id?: string
          view_type?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_visibility: string | null
          adin_mode: string | null
          adin_prompt_status: string | null
          advocacy_interests: string[] | null
          africa_focus_areas: string[] | null
          agrees_to_values: boolean | null
          availability_hours_per_month: number | null
          availability_visible: boolean | null
          available_for: string[] | null
          available_hours_per_month: number | null
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
          connection_count: number | null
          contribution_style: string | null
          contribution_types: string[] | null
          country_of_origin: string | null
          country_of_origin_id: string | null
          country_origin: string | null
          created_at: string
          current_city: string | null
          current_country: string | null
          current_country_code: string | null
          current_country_id: string | null
          current_country_name: string | null
          current_location: string | null
          current_region: string | null
          dashboard_version: string | null
          deleted_at: string | null
          diaspora_origin: string | null
          diaspora_status: string | null
          diaspora_story: string | null
          display_name: string | null
          email: string | null
          email_notifications: boolean | null
          email_visible: boolean | null
          first_action_completed: boolean | null
          first_action_type: string | null
          first_name: string | null
          full_name: string | null
          fundraising_status: string | null
          github_url: string | null
          headline: string | null
          id: string
          impact_areas: string[] | null
          impact_goals: string[] | null
          impact_regions: string[] | null
          industry: string | null
          industry_sectors: string[] | null
          intentions: string[] | null
          interest_tags: string[] | null
          interests: string[] | null
          intro_audio_url: string | null
          intro_text: string | null
          intro_video_url: string | null
          is_admin: boolean | null
          is_beta_tester: boolean | null
          is_public: boolean | null
          languages: string[] | null
          last_active: string | null
          last_active_at: string | null
          last_name: string | null
          last_seen_at: string | null
          linkedin_url: string | null
          location: string | null
          location_preference: string | null
          mentorship_interest: string[] | null
          mentorship_offering: boolean | null
          middle_initial: string | null
          needs: string[] | null
          networking_goals: string[] | null
          newsletter_emails: boolean | null
          notification_preferences: Json | null
          offers: string[] | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_progress: Json
          onboarding_recommendations_viewed: boolean | null
          onboarding_stage: string | null
          open_to_opportunities: boolean | null
          origin_country_code: string | null
          origin_country_name: string | null
          preferred_contact: string | null
          profession: string | null
          professional_role: string | null
          professional_summary: string | null
          profile_completeness_score: number | null
          profile_completion_percentage: number | null
          profile_completion_score: number | null
          profile_picture_url: string | null
          profile_views_count: number | null
          recent_searches: string[] | null
          referral_code: string | null
          referrer_id: string | null
          roles: string[] | null
          sdg_focus: string[] | null
          sectors: string[] | null
          seeking_mentorship: boolean | null
          selected_pillars: string[] | null
          skills: string[] | null
          support_areas: string[] | null
          twitter_handle: string | null
          twitter_url: string | null
          updated_at: string
          user_type: string | null
          username: string
          username_change_count: number | null
          username_changes: number | null
          username_changes_left: number | null
          username_history: Json | null
          venture_name: string | null
          venture_stage: string | null
          verification_method: string | null
          verified: boolean | null
          verified_at: string | null
          visibility: Json | null
          website_url: string | null
          what_to_give: string[] | null
          what_to_receive: string[] | null
          why_contribute: string | null
          years_experience: number | null
          years_in_diaspora: number | null
          years_in_diaspora_text: string | null
          years_of_experience: number | null
        }
        Insert: {
          account_visibility?: string | null
          adin_mode?: string | null
          adin_prompt_status?: string | null
          advocacy_interests?: string[] | null
          africa_focus_areas?: string[] | null
          agrees_to_values?: boolean | null
          availability_hours_per_month?: number | null
          availability_visible?: boolean | null
          available_for?: string[] | null
          available_hours_per_month?: number | null
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
          connection_count?: number | null
          contribution_style?: string | null
          contribution_types?: string[] | null
          country_of_origin?: string | null
          country_of_origin_id?: string | null
          country_origin?: string | null
          created_at?: string
          current_city?: string | null
          current_country?: string | null
          current_country_code?: string | null
          current_country_id?: string | null
          current_country_name?: string | null
          current_location?: string | null
          current_region?: string | null
          dashboard_version?: string | null
          deleted_at?: string | null
          diaspora_origin?: string | null
          diaspora_status?: string | null
          diaspora_story?: string | null
          display_name?: string | null
          email?: string | null
          email_notifications?: boolean | null
          email_visible?: boolean | null
          first_action_completed?: boolean | null
          first_action_type?: string | null
          first_name?: string | null
          full_name?: string | null
          fundraising_status?: string | null
          github_url?: string | null
          headline?: string | null
          id: string
          impact_areas?: string[] | null
          impact_goals?: string[] | null
          impact_regions?: string[] | null
          industry?: string | null
          industry_sectors?: string[] | null
          intentions?: string[] | null
          interest_tags?: string[] | null
          interests?: string[] | null
          intro_audio_url?: string | null
          intro_text?: string | null
          intro_video_url?: string | null
          is_admin?: boolean | null
          is_beta_tester?: boolean | null
          is_public?: boolean | null
          languages?: string[] | null
          last_active?: string | null
          last_active_at?: string | null
          last_name?: string | null
          last_seen_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          location_preference?: string | null
          mentorship_interest?: string[] | null
          mentorship_offering?: boolean | null
          middle_initial?: string | null
          needs?: string[] | null
          networking_goals?: string[] | null
          newsletter_emails?: boolean | null
          notification_preferences?: Json | null
          offers?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_progress?: Json
          onboarding_recommendations_viewed?: boolean | null
          onboarding_stage?: string | null
          open_to_opportunities?: boolean | null
          origin_country_code?: string | null
          origin_country_name?: string | null
          preferred_contact?: string | null
          profession?: string | null
          professional_role?: string | null
          professional_summary?: string | null
          profile_completeness_score?: number | null
          profile_completion_percentage?: number | null
          profile_completion_score?: number | null
          profile_picture_url?: string | null
          profile_views_count?: number | null
          recent_searches?: string[] | null
          referral_code?: string | null
          referrer_id?: string | null
          roles?: string[] | null
          sdg_focus?: string[] | null
          sectors?: string[] | null
          seeking_mentorship?: boolean | null
          selected_pillars?: string[] | null
          skills?: string[] | null
          support_areas?: string[] | null
          twitter_handle?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_type?: string | null
          username: string
          username_change_count?: number | null
          username_changes?: number | null
          username_changes_left?: number | null
          username_history?: Json | null
          venture_name?: string | null
          venture_stage?: string | null
          verification_method?: string | null
          verified?: boolean | null
          verified_at?: string | null
          visibility?: Json | null
          website_url?: string | null
          what_to_give?: string[] | null
          what_to_receive?: string[] | null
          why_contribute?: string | null
          years_experience?: number | null
          years_in_diaspora?: number | null
          years_in_diaspora_text?: string | null
          years_of_experience?: number | null
        }
        Update: {
          account_visibility?: string | null
          adin_mode?: string | null
          adin_prompt_status?: string | null
          advocacy_interests?: string[] | null
          africa_focus_areas?: string[] | null
          agrees_to_values?: boolean | null
          availability_hours_per_month?: number | null
          availability_visible?: boolean | null
          available_for?: string[] | null
          available_hours_per_month?: number | null
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
          connection_count?: number | null
          contribution_style?: string | null
          contribution_types?: string[] | null
          country_of_origin?: string | null
          country_of_origin_id?: string | null
          country_origin?: string | null
          created_at?: string
          current_city?: string | null
          current_country?: string | null
          current_country_code?: string | null
          current_country_id?: string | null
          current_country_name?: string | null
          current_location?: string | null
          current_region?: string | null
          dashboard_version?: string | null
          deleted_at?: string | null
          diaspora_origin?: string | null
          diaspora_status?: string | null
          diaspora_story?: string | null
          display_name?: string | null
          email?: string | null
          email_notifications?: boolean | null
          email_visible?: boolean | null
          first_action_completed?: boolean | null
          first_action_type?: string | null
          first_name?: string | null
          full_name?: string | null
          fundraising_status?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          impact_areas?: string[] | null
          impact_goals?: string[] | null
          impact_regions?: string[] | null
          industry?: string | null
          industry_sectors?: string[] | null
          intentions?: string[] | null
          interest_tags?: string[] | null
          interests?: string[] | null
          intro_audio_url?: string | null
          intro_text?: string | null
          intro_video_url?: string | null
          is_admin?: boolean | null
          is_beta_tester?: boolean | null
          is_public?: boolean | null
          languages?: string[] | null
          last_active?: string | null
          last_active_at?: string | null
          last_name?: string | null
          last_seen_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          location_preference?: string | null
          mentorship_interest?: string[] | null
          mentorship_offering?: boolean | null
          middle_initial?: string | null
          needs?: string[] | null
          networking_goals?: string[] | null
          newsletter_emails?: boolean | null
          notification_preferences?: Json | null
          offers?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_progress?: Json
          onboarding_recommendations_viewed?: boolean | null
          onboarding_stage?: string | null
          open_to_opportunities?: boolean | null
          origin_country_code?: string | null
          origin_country_name?: string | null
          preferred_contact?: string | null
          profession?: string | null
          professional_role?: string | null
          professional_summary?: string | null
          profile_completeness_score?: number | null
          profile_completion_percentage?: number | null
          profile_completion_score?: number | null
          profile_picture_url?: string | null
          profile_views_count?: number | null
          recent_searches?: string[] | null
          referral_code?: string | null
          referrer_id?: string | null
          roles?: string[] | null
          sdg_focus?: string[] | null
          sectors?: string[] | null
          seeking_mentorship?: boolean | null
          selected_pillars?: string[] | null
          skills?: string[] | null
          support_areas?: string[] | null
          twitter_handle?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string
          username_change_count?: number | null
          username_changes?: number | null
          username_changes_left?: number | null
          username_history?: Json | null
          venture_name?: string | null
          venture_stage?: string | null
          verification_method?: string | null
          verified?: boolean | null
          verified_at?: string | null
          visibility?: Json | null
          website_url?: string | null
          what_to_give?: string[] | null
          what_to_receive?: string[] | null
          why_contribute?: string | null
          years_experience?: number | null
          years_in_diaspora?: number | null
          years_in_diaspora_text?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_country_of_origin_id_fkey"
            columns: ["country_of_origin_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_current_country_id_fkey"
            columns: ["current_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contributions: {
        Row: {
          contribution_type: string
          contributor_id: string
          created_at: string | null
          funding_interest: number | null
          id: string
          message: string | null
          project_id: string
          skills_offered: string[] | null
          status: string | null
          time_commitment: string | null
        }
        Insert: {
          contribution_type: string
          contributor_id: string
          created_at?: string | null
          funding_interest?: number | null
          id?: string
          message?: string | null
          project_id: string
          skills_offered?: string[] | null
          status?: string | null
          time_commitment?: string | null
        }
        Update: {
          contribution_type?: string
          contributor_id?: string
          created_at?: string | null
          funding_interest?: number | null
          id?: string
          message?: string | null
          project_id?: string
          skills_offered?: string[] | null
          status?: string | null
          time_commitment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      provinces: {
        Row: {
          country_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          population: number | null
          province_type: string | null
          updated_at: string
        }
        Insert: {
          country_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          population?: number | null
          province_type?: string | null
          updated_at?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          population?: number | null
          province_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provinces_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          continent_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          continent_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          continent_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regions_continent_id_fkey"
            columns: ["continent_id"]
            isOneToOne: false
            referencedRelation: "continents"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      search_preferences: {
        Row: {
          created_at: string
          default_filters: Json | null
          id: string
          saved_searches: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_filters?: Json | null
          id?: string
          saved_searches?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_filters?: Json | null
          id?: string
          saved_searches?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_analytics: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          profile_updated_at: string | null
          skill_name: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          profile_updated_at?: string | null
          skill_name: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          profile_updated_at?: string | null
          skill_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      skill_connections: {
        Row: {
          connection_strength: number | null
          created_at: string | null
          id: string
          shared_skills: string[]
          user_a_id: string | null
          user_b_id: string | null
        }
        Insert: {
          connection_strength?: number | null
          created_at?: string | null
          id?: string
          shared_skills: string[]
          user_a_id?: string | null
          user_b_id?: string | null
        }
        Update: {
          connection_strength?: number | null
          created_at?: string | null
          id?: string
          shared_skills?: string[]
          user_a_id?: string | null
          user_b_id?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          space_id: string
          task_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          space_id: string
          task_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          space_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          space_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          space_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          space_id?: string
          status?: string
          title?: string
          updated_at?: string
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
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
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
      _log_contrib_fixed: {
        Args: {
          _description: string
          _region: string
          _sector: string
          _target: string
          _type: string
          _user: string
        }
        Returns: undefined
      }
      accept_connection: {
        Args: { p_connection: string }
        Returns: undefined
      }
      add_message_reaction: {
        Args: { p_message_id: string; p_reaction: string; p_user_id: string }
        Returns: undefined
      }
      add_notification: {
        Args: {
          p_link_url?: string
          p_message: string
          p_payload?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      approve_beta_application: {
        Args: { admin_id: string; application_id: string }
        Returns: {
          expires_at: string
          magic_link_token: string
        }[]
      }
      are_users_connected: {
        Args: { u1: string; u2: string }
        Returns: boolean
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
      calculate_profile_completion_percentage: {
        Args: { profile_id: string }
        Returns: number
      }
      calculate_profile_completion_score: {
        Args: { profile_id: string }
        Returns: number
      }
      can_create_collaboration: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      can_post_opportunity: {
        Args: { _org_id: string }
        Returns: boolean
      }
      can_send_messages: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      can_view_field: {
        Args: {
          p_field: string
          p_owner: string
          p_viewer: string
          p_visibility: Json
        }
        Returns: boolean
      }
      check_badge_unlocks: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      check_rate_limit: {
        Args: {
          _ip_address: unknown
          _max_submissions?: number
          _submission_type: string
          _time_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit_uid: {
        Args: {
          p_action: string
          p_limit: number
          p_user: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      check_username_available: {
        Args: { p_user_id?: string; p_username: string }
        Returns: boolean
      }
      compute_influence_score: {
        Args: { target_user_id: string }
        Returns: number
      }
      create_admin_notification: {
        Args: {
          p_admin_id: string
          p_message: string
          p_related_resource_id?: string
          p_related_resource_type?: string
          p_severity?: string
          p_title: string
          p_type: string
        }
        Returns: string
      }
      create_audit_log: {
        Args: {
          p_action: string
          p_admin_id: string
          p_details?: Json
          p_ip_address?: unknown
          p_resource_id?: string
          p_resource_type: string
          p_status?: string
          p_user_agent?: string
        }
        Returns: string
      }
      cron_overdue_task_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enqueue_reminders_for_all_users: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      ensure_connection: {
        Args: { u1: string; u2: string }
        Returns: string
      }
      ensure_profile_for_user: {
        Args: { p_email?: string; p_user: string }
        Returns: undefined
      }
      event_owner_id: {
        Args: { p_event: string }
        Returns: string
      }
      find_adin_matches: {
        Args:
          | { match_threshold?: number; user_id: string }
          | { target_user_id: string }
        Returns: {
          match_reason: string
          match_score: number
          matched_user_id: string
          shared_regions: string[]
          shared_sectors: string[]
        }[]
      }
      generate_join_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_magic_link_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_username: {
        Args: { _full_name: string }
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
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_public: boolean
          user_id: string
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
          limit_count?: number
          sector_filter?: string
        }
        Returns: {
          avatar_url: string
          full_name: string
          location: string
          rank: number
          score: number
          user_id: string
        }[]
      }
      get_message_reactions: {
        Args: { p_message_ids: string[] }
        Returns: {
          created_at: string
          id: string
          message_id: string
          reaction: string
          user_id: string
        }[]
      }
      get_newsletter_followers: {
        Args: { newsletter_user_id: string }
        Returns: {
          email: string
          full_name: string
          user_id: string
        }[]
      }
      get_pending_reminders: {
        Args: { batch_size?: number }
        Returns: {
          cohort: string
          metadata: Json
          reminder_id: string
          reminder_type: string
          user_email: string
          user_id: string
        }[]
      }
      get_public_profiles: {
        Args: { p_limit?: number; p_user_id?: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          headline: string
          id: string
          links: Json
          location: string
          org: string
          skills: string[]
          username: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_email: {
        Args: { email_address: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_connection_participant: {
        Args: { p_connection: string }
        Returns: boolean
      }
      is_event_owner: {
        Args: { p_event: string; p_user: string }
        Returns: boolean
      }
      is_member_of_space: {
        Args: {
          _approved_only?: boolean
          _roles?: string[]
          _space: string
          _user: string
        }
        Returns: boolean
      }
      is_prelaunch_locked: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_connection_event: {
        Args: { p_connection: string; p_event_type: string; p_payload?: Json }
        Returns: string
      }
      log_engagement_event: {
        Args: {
          cohort_param?: string
          event_context_param?: Json
          event_type_param: string
          target_user_id: string
        }
        Returns: string
      }
      log_post_event: {
        Args: { p_event_type: string; p_metadata?: Json; p_post_id: string }
        Returns: undefined
      }
      log_post_view: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      log_profile_view: {
        Args: { p_profile_id: string; p_view_type?: string }
        Returns: undefined
      }
      make_user_admin: {
        Args: { user_email: string }
        Returns: string
      }
      owns_organization: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      profile_meets_visibility_requirement: {
        Args: { min_score?: number; user_id_param: string }
        Returns: boolean
      }
      promote_from_waitlist: {
        Args: { p_event: string }
        Returns: string
      }
      recent_engagement_score_for_opportunity: {
        Args: { p_op: string }
        Returns: number
      }
      recent_engagement_score_for_space: {
        Args: { p_space: string }
        Returns: number
      }
      recent_engagement_score_for_user: {
        Args: { p_target_user: string }
        Returns: number
      }
      reject_html: {
        Args: { _txt: string }
        Returns: boolean
      }
      remove_message_reaction: {
        Args: { p_message_id: string; p_reaction: string; p_user_id: string }
        Returns: undefined
      }
      reset_seeded_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      resolve_nudge: {
        Args: { p_nudge: string; p_snooze_until?: string; p_status: string }
        Returns: undefined
      }
      rpc_adin_recommend_opportunities: {
        Args: Record<PropertyKey, never> | { p_limit?: number }
        Returns: {
          match_score: number
          signal_created_at: string
          signal_id: string
          signal_title: string
          signal_type: string
        }[]
      }
      rpc_adin_recommend_people: {
        Args: Record<PropertyKey, never> | { p_limit?: number }
        Returns: {
          match_reason: string
          match_score: number
          matched_user_id: string
          shared_regions: string[]
          shared_sectors: string[]
        }[]
      }
      rpc_adin_recommend_spaces: {
        Args: Record<PropertyKey, never> | { p_limit?: number }
        Returns: {
          match_score: number
          space_id: string
          space_name: string
        }[]
      }
      rpc_adin_recommendations_opportunities: {
        Args: { p_limit?: number; p_threshold?: number; p_user_id: string }
        Returns: {
          match_score: number
          signal_created_at: string
          signal_id: string
          signal_title: string
          signal_type: string
        }[]
      }
      rpc_adin_recommendations_people: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          match_reason: string
          match_score: number
          matched_user_id: string
          shared_regions: string[]
          shared_sectors: string[]
        }[]
      }
      rpc_check_in_by_token: {
        Args: { p_event: string; p_token: string }
        Returns: Json
      }
      rpc_create_post: {
        Args:
          | {
              content: string
              embed_metadata?: Json
              link_metadata?: Json
              link_url?: string
              media_url?: string
              opportunity_link?: string
              opportunity_type?: string
              pillar?: string
              poll_expires_at?: string
              poll_options?: Json
              status?: string
              type?: string
              visibility?: string
            }
          | { p: Json }
          | { p_content: string; p_media_url?: string; p_pillar?: string }
        Returns: string
      }
      rpc_dashboard_counts: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      rpc_event_approve: {
        Args: { p_registration: string }
        Returns: undefined
      }
      rpc_event_attendee_count: {
        Args: { p_event: string }
        Returns: number
      }
      rpc_event_attendees: {
        Args: { p_event: string }
        Returns: {
          full_name: string
          registered_at: string
          user_id: string
          username: string
        }[]
      }
      rpc_event_decline: {
        Args: { p_registration: string }
        Returns: undefined
      }
      rpc_event_join_link: {
        Args: { p_token: string }
        Returns: string
      }
      rpc_event_join_waitlist: {
        Args: { p_event: string }
        Returns: number
      }
      rpc_event_register: {
        Args:
          | {
              p_answers?: Json
              p_event: string
              p_profile: string
              p_ticket: string
            }
          | { p_answers?: Json; p_event: string; p_ticket_type?: string }
          | { p_event: string }
        Returns: undefined
      }
      rpc_event_set_status: {
        Args: { p_event: string; p_status: string; p_user: string }
        Returns: undefined
      }
      rpc_event_unregister: {
        Args: { p_event: string }
        Returns: undefined
      }
      rpc_event_waitlist_promote: {
        Args: { p_event: string; p_user?: string }
        Returns: string
      }
      rpc_health_snapshot: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      rpc_log_contribution: {
        Args:
          | {
              p_description?: string
              p_region?: string
              p_sector?: string
              p_target_id: string
              p_type: string
            }
          | {
              p_metadata?: Json
              p_target_id: string
              p_target_title?: string
              p_type: string
            }
        Returns: undefined
      }
      rpc_membership_approve: {
        Args: { p_space: string; p_user: string }
        Returns: undefined
      }
      rpc_membership_reject: {
        Args: { p_space: string; p_user: string }
        Returns: undefined
      }
      rpc_notifications_list: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          body: string
          created_at: string
          id: string
          metadata: Json
          read_at: string
          title: string
        }[]
      }
      rpc_notifications_mark_all_read: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      rpc_notifications_mark_read: {
        Args: { p_ids: string[] }
        Returns: number
      }
      rpc_public_profile_bundle: {
        Args: { p_username: string }
        Returns: Json
      }
      rpc_public_profile_by_id: {
        Args: { p_id: string }
        Returns: {
          avatar_url: string
          bio: string
          company: string
          created_at: string
          full_name: string
          headline: string
          id: string
          impact_areas: string[]
          location: string
          profession: string
          region: string
          skills: string[]
          username: string
        }[]
      }
      rpc_public_profiles: {
        Args: {
          p_limit?: number
          p_location?: string
          p_profession?: string
          p_skills?: string[]
        }
        Returns: {
          avatar_url: string
          bio: string
          company: string
          created_at: string
          full_name: string
          headline: string
          id: string
          impact_areas: string[]
          location: string
          profession: string
          region: string
          skills: string[]
          username: string
        }[]
      }
      rpc_request_join_space: {
        Args: { p_space: string }
        Returns: undefined
      }
      rpc_run_cron_overdue_task_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rpc_save_opportunity: {
        Args: { p_op: string }
        Returns: undefined
      }
      rpc_seed_reco_demo: {
        Args: { p_opps?: number; p_people?: number; p_spaces?: number }
        Returns: Json
      }
      rpc_seed_verified_contributor: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rpc_task_assign: {
        Args: { p_assignee: string; p_task: string }
        Returns: undefined
      }
      rpc_task_comment: {
        Args: { p_body: string; p_task: string }
        Returns: string
      }
      rpc_task_create: {
        Args: {
          p_description?: string
          p_due?: string
          p_priority?: string
          p_space: string
          p_title: string
        }
        Returns: string
      }
      rpc_task_set_status: {
        Args: { p_status: string; p_task: string }
        Returns: undefined
      }
      rpc_task_update: {
        Args: {
          p_description?: string
          p_due?: string
          p_priority?: string
          p_task: string
          p_title?: string
        }
        Returns: undefined
      }
      rpc_toggle_spotlight: {
        Args: { p_post: string; p_value: boolean }
        Returns: undefined
      }
      send_notification: {
        Args: {
          p_body: string
          p_entity_id: string
          p_entity_type: string
          p_recipient_id: string
          p_title: string
          p_type: string
        }
        Returns: string
      }
      set_connection_intention: {
        Args: {
          p_connection: string
          p_notes?: string
          p_type: string
          p_visibility?: string
        }
        Returns: string
      }
      trigger_adin_prompt: {
        Args: { event_type: string; target_user_id: string }
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
        Args: { pillar: string; points?: number; target_user_id: string }
        Returns: undefined
      }
      update_event_attendee_count: {
        Args: { p_event: string }
        Returns: undefined
      }
      update_reminder_status: {
        Args: {
          error_message?: string
          new_status: string
          reminder_id: string
        }
        Returns: boolean
      }
      update_username: {
        Args: { new_username: string }
        Returns: undefined
      }
      validate_invite_code: {
        Args: { invite_code: string }
        Returns: Json
      }
      validate_prelaunch_access: {
        Args: { user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "moderator" | "admin"
      application_status:
        | "pending"
        | "reviewing"
        | "accepted"
        | "rejected"
        | "withdrawn"
      contribution_type: "time" | "expertise" | "network" | "capital"
      opportunity_status: "draft" | "active" | "paused" | "closed" | "archived"
      opportunity_visibility: "public" | "network_only" | "private"
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
      app_role: ["user", "moderator", "admin"],
      application_status: [
        "pending",
        "reviewing",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      contribution_type: ["time", "expertise", "network", "capital"],
      opportunity_status: ["draft", "active", "paused", "closed", "archived"],
      opportunity_visibility: ["public", "network_only", "private"],
    },
  },
} as const
