/**
 * DNA Platform - Seeded Test Profiles
 *
 * This script creates 5 fully seeded test profiles representing African Diaspora
 * members and allies for evaluating user engagement and interaction flows.
 *
 * IMPORTANT: These profiles are for TESTING ONLY and include:
 * - Complete profile metadata (100% of supported components)
 * - Multiple posts (text, image, video, link)
 * - Stories (ephemeral content)
 * - Video content
 * - External links
 * - Auto-connect capability (test-only flag)
 *
 * NON-PRODUCTION SAFEGUARDS:
 * - All entities marked with is_seeded = true
 * - All profiles marked with is_test_account = true
 * - Auto-connect only works between test accounts
 */

import { createClient } from '@supabase/supabase-js';
import { testProfiles } from './data/profiles';
import { testPosts } from './data/posts';
import { testStories } from './data/stories';
import { testConnections } from './data/connections';
import { validateProfileCompleteness } from './utils/validation';
import { TEST_PROFILE_IDS } from './constants';

// Re-export constants for external use
export { TEST_PROFILE_IDS } from './constants';

// Environment setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SeedResult {
  success: boolean;
  profiles_created: number;
  posts_created: number;
  stories_created: number;
  connections_created: number;
  errors: string[];
  validation_results: Record<string, { score: number; missing: string[] }>;
}

async function cleanupExistingTestData(): Promise<void> {
  console.log('🧹 Cleaning up existing test data...');

  const profileIds = Object.values(TEST_PROFILE_IDS);

  // Delete in order to respect foreign key constraints
  await supabase.from('post_comments').delete().in('author_id', profileIds);
  await supabase.from('post_likes').delete().in('user_id', profileIds);
  await supabase.from('post_views').delete().in('viewer_id', profileIds);
  await supabase.from('posts').delete().in('author_id', profileIds);
  await supabase.from('connections').delete().or(
    `requester_id.in.(${profileIds.join(',')}),recipient_id.in.(${profileIds.join(',')})`
  );
  await supabase.from('profiles').delete().in('id', profileIds);

  console.log('✅ Cleanup complete');
}

async function seedProfiles(): Promise<{ created: number; errors: string[] }> {
  console.log('👤 Seeding test profiles...');
  const errors: string[] = [];
  let created = 0;

  for (const profile of testProfiles) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      errors.push(`Profile ${profile.full_name}: ${error.message}`);
      console.error(`❌ Failed to create profile ${profile.full_name}:`, error.message);
    } else {
      created++;
      console.log(`✅ Created profile: ${profile.full_name}`);
    }
  }

  return { created, errors };
}

async function seedPosts(): Promise<{ created: number; errors: string[] }> {
  console.log('📝 Seeding test posts...');
  const errors: string[] = [];
  let created = 0;

  for (const post of testPosts) {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();

    if (error) {
      errors.push(`Post by ${post.author_id}: ${error.message}`);
      console.error(`❌ Failed to create post:`, error.message);
    } else {
      created++;
    }
  }

  console.log(`✅ Created ${created} posts`);
  return { created, errors };
}

async function seedStories(): Promise<{ created: number; errors: string[] }> {
  console.log('📖 Seeding test stories...');
  const errors: string[] = [];
  let created = 0;

  for (const story of testStories) {
    const { data, error } = await supabase
      .from('posts')
      .insert(story)
      .select()
      .single();

    if (error) {
      errors.push(`Story by ${story.author_id}: ${error.message}`);
      console.error(`❌ Failed to create story:`, error.message);
    } else {
      created++;
    }
  }

  console.log(`✅ Created ${created} stories`);
  return { created, errors };
}

async function seedConnections(): Promise<{ created: number; errors: string[] }> {
  console.log('🤝 Seeding test connections...');
  const errors: string[] = [];
  let created = 0;

  for (const connection of testConnections) {
    const { data, error } = await supabase
      .from('connections')
      .insert(connection)
      .select()
      .single();

    if (error) {
      errors.push(`Connection ${connection.requester_id} -> ${connection.recipient_id}: ${error.message}`);
      console.error(`❌ Failed to create connection:`, error.message);
    } else {
      created++;
    }
  }

  console.log(`✅ Created ${created} connections`);
  return { created, errors };
}

async function validateAllProfiles(): Promise<Record<string, { score: number; missing: string[] }>> {
  console.log('🔍 Validating profile completeness...');
  const results: Record<string, { score: number; missing: string[] }> = {};

  for (const profile of testProfiles) {
    const validation = validateProfileCompleteness(profile);
    results[profile.full_name] = validation;

    if (validation.score < 100) {
      console.log(`⚠️ ${profile.full_name}: ${validation.score}% complete. Missing: ${validation.missing.join(', ')}`);
    } else {
      console.log(`✅ ${profile.full_name}: 100% complete`);
    }
  }

  return results;
}

export async function seedTestProfiles(options?: { cleanup?: boolean }): Promise<SeedResult> {
  console.log('🌱 Starting DNA Platform Test Profile Seeding...\n');

  const result: SeedResult = {
    success: true,
    profiles_created: 0,
    posts_created: 0,
    stories_created: 0,
    connections_created: 0,
    errors: [],
    validation_results: {},
  };

  try {
    // Optional cleanup
    if (options?.cleanup !== false) {
      await cleanupExistingTestData();
    }

    // Seed profiles
    const profileResult = await seedProfiles();
    result.profiles_created = profileResult.created;
    result.errors.push(...profileResult.errors);

    // Seed posts
    const postResult = await seedPosts();
    result.posts_created = postResult.created;
    result.errors.push(...postResult.errors);

    // Seed stories
    const storyResult = await seedStories();
    result.stories_created = storyResult.created;
    result.errors.push(...storyResult.errors);

    // Seed connections
    const connectionResult = await seedConnections();
    result.connections_created = connectionResult.created;
    result.errors.push(...connectionResult.errors);

    // Validate
    result.validation_results = await validateAllProfiles();

    // Determine overall success
    result.success = result.errors.length === 0;

  } catch (error) {
    result.success = false;
    result.errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Summary
  console.log('\n📊 Seeding Summary:');
  console.log(`  • Profiles: ${result.profiles_created}/${testProfiles.length}`);
  console.log(`  • Posts: ${result.posts_created}/${testPosts.length}`);
  console.log(`  • Stories: ${result.stories_created}/${testStories.length}`);
  console.log(`  • Connections: ${result.connections_created}/${testConnections.length}`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️ Errors (${result.errors.length}):`);
    result.errors.forEach(e => console.log(`  - ${e}`));
  }

  console.log(`\n${result.success ? '✅' : '❌'} Seeding ${result.success ? 'completed successfully' : 'completed with errors'}`);

  return result;
}

// Run if executed directly
if (require.main === module) {
  seedTestProfiles()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { testProfiles, testPosts, testStories, testConnections };
