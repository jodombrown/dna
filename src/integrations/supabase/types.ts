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
      communities: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          member_count: number | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          member_count?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          member_count?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string | null
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
      connections: {
        Row: {
          created_at: string
          id: string
          message: string | null
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          recipient_id: string
          requester_id: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          recipient_id?: string
          requester_id?: string
          status?: string
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
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          registration_status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          registration_status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          registration_status?: string | null
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
        Relationships: [
          {
            foreignKeyName: "initiatives_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          newsletter_id: string
          subscribed_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          newsletter_id: string
          subscribed_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          newsletter_id?: string
          subscribed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscriptions_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
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
      onboarding_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
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
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          reaction_type?: string
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
      post_shares: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          shared_content: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          shared_content?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          shared_content?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          article_summary: string | null
          article_title: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          hashtags: string[] | null
          id: string
          is_published: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          post_type: string | null
          shared_community_id: string | null
          shared_event_id: string | null
          shares_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_summary?: string | null
          article_title?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: string | null
          shared_community_id?: string | null
          shared_event_id?: string | null
          shares_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_summary?: string | null
          article_title?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: string | null
          shared_community_id?: string | null
          shared_event_id?: string | null
          shares_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_shared_community_id_fkey"
            columns: ["shared_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_shared_event_id_fkey"
            columns: ["shared_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          availability_for: string[] | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          country_of_origin: string | null
          created_at: string
          education: string | null
          expertise: string[] | null
          full_name: string
          id: string
          is_investor: boolean | null
          is_mentor: boolean | null
          languages: string[] | null
          linkedin_url: string | null
          location: string | null
          looking_for_opportunities: boolean | null
          profession: string | null
          updated_at: string
          user_id: string | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          availability_for?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          country_of_origin?: string | null
          created_at?: string
          education?: string | null
          expertise?: string[] | null
          full_name: string
          id?: string
          is_investor?: boolean | null
          is_mentor?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          looking_for_opportunities?: boolean | null
          profession?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          availability_for?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          country_of_origin?: string | null
          created_at?: string
          education?: string | null
          expertise?: string[] | null
          full_name?: string
          id?: string
          is_investor?: boolean | null
          is_mentor?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          looking_for_opportunities?: boolean | null
          profession?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_visibility: string | null
          achievements: string | null
          availability_for_mentoring: boolean | null
          available_for: string[] | null
          avatar_url: string | null
          banner_image_url: string | null
          banner_url: string | null
          bio: string | null
          certifications: string | null
          city: string | null
          community_involvement: string | null
          company: string | null
          country_of_origin: string | null
          created_at: string
          current_country: string | null
          diaspora_networks: string[] | null
          diaspora_origin: string | null
          education: string | null
          email: string | null
          engagement_intentions: string[] | null
          first_community_joined_at: string | null
          first_connection_made_at: string | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          giving_back_initiatives: string | null
          headline: string | null
          home_country_projects: string | null
          id: string
          impact_areas: string[] | null
          industry: string | null
          innovation_pathways: string | null
          interests: string[] | null
          is_public: boolean | null
          languages: string | null
          linkedin_url: string | null
          location: string | null
          looking_for_opportunities: boolean | null
          mentorship_areas: string[] | null
          my_dna_statement: string | null
          notifications_enabled: boolean | null
          onboarding_status: Json | null
          organization: string | null
          past_contributions: string | null
          phone: string | null
          profession: string | null
          professional_role: string | null
          professional_sectors: string[] | null
          profile_completed_at: string | null
          profile_picture_url: string | null
          skills: string[] | null
          skills_needed: string[] | null
          skills_offered: string[] | null
          updated_at: string
          volunteer_experience: string | null
          website_url: string | null
          years_experience: number | null
          years_in_diaspora: number | null
        }
        Insert: {
          account_visibility?: string | null
          achievements?: string | null
          availability_for_mentoring?: boolean | null
          available_for?: string[] | null
          avatar_url?: string | null
          banner_image_url?: string | null
          banner_url?: string | null
          bio?: string | null
          certifications?: string | null
          city?: string | null
          community_involvement?: string | null
          company?: string | null
          country_of_origin?: string | null
          created_at?: string
          current_country?: string | null
          diaspora_networks?: string[] | null
          diaspora_origin?: string | null
          education?: string | null
          email?: string | null
          engagement_intentions?: string[] | null
          first_community_joined_at?: string | null
          first_connection_made_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          giving_back_initiatives?: string | null
          headline?: string | null
          home_country_projects?: string | null
          id: string
          impact_areas?: string[] | null
          industry?: string | null
          innovation_pathways?: string | null
          interests?: string[] | null
          is_public?: boolean | null
          languages?: string | null
          linkedin_url?: string | null
          location?: string | null
          looking_for_opportunities?: boolean | null
          mentorship_areas?: string[] | null
          my_dna_statement?: string | null
          notifications_enabled?: boolean | null
          onboarding_status?: Json | null
          organization?: string | null
          past_contributions?: string | null
          phone?: string | null
          profession?: string | null
          professional_role?: string | null
          professional_sectors?: string[] | null
          profile_completed_at?: string | null
          profile_picture_url?: string | null
          skills?: string[] | null
          skills_needed?: string[] | null
          skills_offered?: string[] | null
          updated_at?: string
          volunteer_experience?: string | null
          website_url?: string | null
          years_experience?: number | null
          years_in_diaspora?: number | null
        }
        Update: {
          account_visibility?: string | null
          achievements?: string | null
          availability_for_mentoring?: boolean | null
          available_for?: string[] | null
          avatar_url?: string | null
          banner_image_url?: string | null
          banner_url?: string | null
          bio?: string | null
          certifications?: string | null
          city?: string | null
          community_involvement?: string | null
          company?: string | null
          country_of_origin?: string | null
          created_at?: string
          current_country?: string | null
          diaspora_networks?: string[] | null
          diaspora_origin?: string | null
          education?: string | null
          email?: string | null
          engagement_intentions?: string[] | null
          first_community_joined_at?: string | null
          first_connection_made_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          giving_back_initiatives?: string | null
          headline?: string | null
          home_country_projects?: string | null
          id?: string
          impact_areas?: string[] | null
          industry?: string | null
          innovation_pathways?: string | null
          interests?: string[] | null
          is_public?: boolean | null
          languages?: string | null
          linkedin_url?: string | null
          location?: string | null
          looking_for_opportunities?: boolean | null
          mentorship_areas?: string[] | null
          my_dna_statement?: string | null
          notifications_enabled?: boolean | null
          onboarding_status?: Json | null
          organization?: string | null
          past_contributions?: string | null
          phone?: string | null
          profession?: string | null
          professional_role?: string | null
          professional_sectors?: string[] | null
          profile_completed_at?: string | null
          profile_picture_url?: string | null
          skills?: string[] | null
          skills_needed?: string[] | null
          skills_offered?: string[] | null
          updated_at?: string
          volunteer_experience?: string | null
          website_url?: string | null
          years_experience?: number | null
          years_in_diaspora?: number | null
        }
        Relationships: []
      }
      project_participants: {
        Row: {
          id: string
          joined_at: string | null
          participant_role: string | null
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          participant_role?: string | null
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          participant_role?: string | null
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_user_id_fkey"
            columns: ["user_id"]
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
        Relationships: [
          {
            foreignKeyName: "projects_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_connections_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          is_public: boolean
        }[]
      }
      has_role: {
        Args:
          | { _user_id: string; _role: Database["public"]["Enums"]["app_role"] }
          | { _user_id: string; _role: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
