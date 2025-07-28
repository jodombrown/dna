import { supabase } from '@/integrations/supabase/client';

export interface SeedUser {
  id: string;
  full_name: string;
  email: string;
  diaspora_identity: string;
  country_of_origin: string;
  country_of_residence: string;
  last_seen_at: string;
}

export interface SeedConnection {
  id: string;
  user_id_1: string;
  user_id_2: string;
  created_at: string;
}

export interface SeedPost {
  id: string;
  author_id: string;
  content: string;
  pillar: string;
  created_at: string;
}

export interface SeedEvent {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  start_time: string;
  created_at: string;
}

export const seedDataService = {
  // Export data as JSON or CSV
  async exportData(format: 'json' | 'csv' = 'json') {
    try {
      // Get seeded data from all tables using explicit queries to avoid type issues
      const profilesQuery = supabase.from('profiles').select('*').eq('is_seeded', true);
      const connectionsQuery = supabase.from('contact_requests').select('*').eq('is_seeded', true);
      const postsQuery = supabase.from('posts').select('*').eq('is_seeded', true);
      const eventsQuery = supabase.from('events').select('*').eq('is_seeded', true);

      const [profilesResult, connectionsResult, postsResult, eventsResult] = await Promise.all([
        profilesQuery,
        connectionsQuery,
        postsQuery,
        eventsQuery
      ]);

      const data = {
        profiles: profilesResult.data || [],
        connections: connectionsResult.data || [],
        posts: postsResult.data || [],
        events: eventsResult.data || []
      };

      if (format === 'csv') {
        return this.convertToCSV(data);
      }

      return data;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },

  // Clear all seeded data
  async clearSeedData() {
    try {
      await supabase.from('contact_requests').delete().eq('is_seeded', true);
      await supabase.from('posts').delete().eq('is_seeded', true);
      await supabase.from('events').delete().eq('is_seeded', true);
      await supabase.from('profiles').delete().eq('is_seeded', true);

      return { success: true, message: 'All seed data cleared successfully' };
    } catch (error) {
      console.error('Clear seed data failed:', error);
      throw error;
    }
  },

  // Import seed data (requires admin privileges)
  async importSeedData(data: {
    profiles: any[];
    connections: any[];
    posts: any[];
    events: any[];
  }) {
    try {
      // First clear existing seed data
      await this.clearSeedData();

      // Insert new seed data sequentially to avoid FK issues
      const profileResults = data.profiles.length > 0 ? await this.insertSeedProfiles(data.profiles) : [];
      const connectionResults = data.connections.length > 0 ? await this.insertSeedConnections(data.connections) : [];
      const postResults = data.posts.length > 0 ? await this.insertSeedPosts(data.posts) : [];
      const eventResults = data.events.length > 0 ? await this.insertSeedEvents(data.events) : [];

      return {
        success: true,
        message: 'Seed data imported successfully',
        results: {
          profiles: profileResults,
          connections: connectionResults,
          posts: postResults,
          events: eventResults
        }
      };
    } catch (error) {
      console.error('Import seed data failed:', error);
      throw error;
    }
  },

  // Helper methods for inserting different data types
  async insertSeedProfiles(profiles: any[]) {
    const formattedProfiles = profiles.map((profile: any) => ({
      id: profile.id, // Include the id field as required
      full_name: profile.full_name,
      email: profile.email,
      diaspora_origin: profile.diaspora_identity,
      country_of_origin: profile.country_of_origin,
      current_country: profile.country_of_residence,
      last_seen_at: profile.last_seen_at,
      is_seeded: true,
      is_public: true
    }));

    // Use explicit typing to avoid deep instantiation issues
    const { data, error } = await supabase
      .from('profiles')
      .insert(formattedProfiles as any[])
      .select();

    if (error) throw error;
    return data;
  },

  async insertSeedConnections(connections: any[]) {
    const formattedConnections = connections.map((conn: any) => ({
      sender_id: conn.user_id_1,
      receiver_id: conn.user_id_2,
      status: 'accepted',
      purpose: 'networking',
      message: 'Seed connection',
      is_seeded: true,
      created_at: conn.created_at
    }));

    const { data, error } = await supabase
      .from('contact_requests')
      .insert(formattedConnections as any[])
      .select();

    if (error) throw error;
    return data;
  },

  async insertSeedPosts(posts: any[]) {
    const formattedPosts = posts.map((post: any) => ({
      author_id: post.author_id,
      user_id: post.author_id, // posts table requires user_id
      content: post.content,
      pillar: post.pillar,
      visibility: 'public',
      is_seeded: true,
      created_at: post.created_at
    }));

    const { data, error } = await supabase
      .from('posts')
      .insert(formattedPosts as any[])
      .select();

    if (error) throw error;
    return data;
  },

  async insertSeedEvents(events: any[]) {
    const formattedEvents = events.map((event: any) => ({
      created_by: event.creator_id,
      title: event.title,
      description: event.description,
      date_time: event.start_time,
      location: 'Virtual Event',
      is_seeded: true,
      created_at: event.created_at
    }));

    const { data, error } = await supabase
      .from('events')
      .insert(formattedEvents as any[])
      .select();

    if (error) throw error;
    return data;
  },

  // Convert data to CSV format
  convertToCSV(data: any) {
    const csvData: { [key: string]: string } = {};

    Object.keys(data).forEach(table => {
      const rows = data[table];
      if (rows.length === 0) {
        csvData[table] = '';
        return;
      }

      const headers = Object.keys(rows[0]);
      const csvRows = [
        headers.join(','),
        ...rows.map((row: any) => 
          headers.map(header => 
            JSON.stringify(row[header] || '')
          ).join(',')
        )
      ];

      csvData[table] = csvRows.join('\n');
    });

    return csvData;
  },

  // Download data as file
  downloadData(data: any, filename: string, format: 'json' | 'csv' = 'json') {
    const content = format === 'json' 
      ? JSON.stringify(data, null, 2)
      : typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      
    const blob = new Blob([content], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};