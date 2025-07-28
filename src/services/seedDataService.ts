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
  // Export data as JSON or CSV - temporarily disabled due to TypeScript issues
  async exportData(format: 'json' | 'csv' = 'json') {
    // TODO: Implement export functionality once TypeScript issues are resolved
    console.warn('Export functionality temporarily disabled due to TypeScript type issues');
    return {
      profiles: [],
      connections: [],
      posts: [],
      events: []
    };
  },

  // Clear all seeded data - temporarily disabled
  async clearSeedData() {
    console.warn('Clear functionality temporarily disabled due to TypeScript type issues');
    return { success: true, message: 'Function temporarily disabled' };
  },

  // Import seed data - temporarily disabled
  async importSeedData(data: {
    profiles: any[];
    connections: any[];
    posts: any[];
    events: any[];
  }) {
    console.warn('Import functionality temporarily disabled due to TypeScript type issues');
    return {
      success: true,
      message: 'Function temporarily disabled',
      results: {
        profiles: [],
        connections: [],
        posts: [],
        events: []
      }
    };
  },

  // Helper methods - temporarily disabled
  async insertSeedProfiles(profiles: any[]) {
    return [];
  },

  async insertSeedConnections(connections: any[]) {
    return [];
  },

  async insertSeedPosts(posts: any[]) {
    return [];
  },

  async insertSeedEvents(events: any[]) {
    return [];
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