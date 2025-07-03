export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_reports: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_scheduled: boolean | null
          last_generated: string | null
          report_config: Json
          report_name: string
          report_type: string
          schedule_config: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_scheduled?: boolean | null
          last_generated?: string | null
          report_config: Json
          report_name: string
          report_type: string
          schedule_config?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_scheduled?: boolean | null
          last_generated?: string | null
          report_config?: Json
          report_name?: string
          report_type?: string
          schedule_config?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          event_type: string
          id: string
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      communities: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
        Relationships: []
      }
      community_flags: {
        Row: {
          community_id: string
          created_at: string
          flag_type: string
          flagged_by: string | null
          id: string
          moderator_notes: string | null
          reason: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          community_id: string
          created_at?: string
          flag_type: string
          flagged_by?: string | null
          id?: string
          moderator_notes?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          flag_type?: string
          flagged_by?: string | null
          id?: string
          moderator_notes?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_flags_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string
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
          flag_type: Database["public"]["Enums"]["flag_type"]
          flagged_by: string | null
          id: string
          moderator_notes: string | null
          reason: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["moderation_status"]
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          flag_type: Database["public"]["Enums"]["flag_type"]
          flagged_by?: string | null
          id?: string
          moderator_notes?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["moderation_status"]
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          flag_type?: Database["public"]["Enums"]["flag_type"]
          flagged_by?: string | null
          id?: string
          moderator_notes?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["moderation_status"]
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
      events: {
        Row: {
          attendee_count: number | null
          banner_url: string | null
          created_at: string
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          id: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          id?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          id?: string
          target_id?: string
          target_type?: string
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
      initiatives: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          impact_area: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          impact_area?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          impact_area?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      job_posts: {
        Row: {
          application_email: string | null
          application_url: string | null
          company: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          job_type: string | null
          location: string | null
          posted_by: string
          requirements: string | null
          salary_range: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          application_email?: string | null
          application_url?: string | null
          company: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          location?: string | null
          posted_by: string
          requirements?: string | null
          salary_range?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          application_email?: string | null
          application_url?: string | null
          company?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          location?: string | null
          posted_by?: string
          requirements?: string | null
          salary_range?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_referrals: {
        Row: {
          created_at: string
          id: string
          job_id: string
          note: string | null
          referred_id: string
          referrer_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          note?: string | null
          referred_id: string
          referrer_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          note?: string | null
          referred_id?: string
          referrer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_referrals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
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
      newsletters: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          publication_date: string | null
          subscriber_count: number | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by: string
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          publication_date?: string | null
          subscriber_count?: number | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          publication_date?: string | null
          subscriber_count?: number | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_type: string
          actor_id: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          actor_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          actor_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          target_id?: string
          target_type?: string
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
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          is_published: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          post_type: string | null
          shares_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          post_type?: string | null
          shares_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          post_type?: string | null
          shares_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          current_country: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          interest_tags: string[] | null
          interests: string[] | null
          is_public: boolean | null
          linkedin_url: string | null
          location: string | null
          onboarding_completed_at: string | null
          profession: string | null
          professional_role: string | null
          profile_picture_url: string | null
          skills: string[] | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          current_country?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          interest_tags?: string[] | null
          interests?: string[] | null
          is_public?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          onboarding_completed_at?: string | null
          profession?: string | null
          professional_role?: string | null
          profile_picture_url?: string | null
          skills?: string[] | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          current_country?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          interest_tags?: string[] | null
          interests?: string[] | null
          is_public?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          onboarding_completed_at?: string | null
          profession?: string | null
          professional_role?: string | null
          profile_picture_url?: string | null
          skills?: string[] | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
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
      saved_items: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string
          time_period: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string
          time_period: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string
          time_period?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          _ip_address: unknown
          _submission_type: string
          _max_submissions?: number
          _time_window_minutes?: number
        }
        Returns: boolean
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
      get_platform_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin_user: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role:
        | "super_admin"
        | "content_moderator"
        | "analytics_viewer"
        | "user_manager"
        | "event_manager"
      flag_type:
        | "inappropriate_content"
        | "spam"
        | "harassment"
        | "misinformation"
        | "copyright_violation"
        | "other"
      moderation_status:
        | "pending"
        | "approved"
        | "rejected"
        | "hidden"
        | "deleted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: [
        "super_admin",
        "content_moderator",
        "analytics_viewer",
        "user_manager",
        "event_manager",
      ],
      flag_type: [
        "inappropriate_content",
        "spam",
        "harassment",
        "misinformation",
        "copyright_violation",
        "other",
      ],
      moderation_status: [
        "pending",
        "approved",
        "rejected",
        "hidden",
        "deleted",
      ],
    },
  },
} as const
