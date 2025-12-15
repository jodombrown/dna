/**
 * DNA Platform - Seeded Test Profiles Functional Tests
 *
 * Test suite for validating:
 * - Profile completeness
 * - Content rendering (posts, stories, videos, links)
 * - Interaction flows
 * - Auto-connect logic
 *
 * Run with: npx tsx scripts/seed-test-profiles/tests/functional.test.ts
 */

import { createClient } from '@supabase/supabase-js';
import { testProfiles } from '../data/profiles';
import { testPosts } from '../data/posts';
import { testStories } from '../data/stories';
import { testConnections } from '../data/connections';
import {
  validateProfileCompleteness,
  validateAllProfiles,
  validatePost,
  validateStory,
  validateConnection,
} from '../utils/validation';
import { TEST_PROFILE_IDS } from '../constants';

// Test configuration
const TEST_CONFIG = {
  VERBOSE: process.env.VERBOSE === 'true',
  REQUIRE_DB: process.env.REQUIRE_DB === 'true',
};

// Test result types
interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: unknown;
}

interface TestSuiteResult {
  suiteName: string;
  passed: number;
  failed: number;
  results: TestResult[];
}

// Test utilities
function test(name: string, fn: () => boolean | { passed: boolean; message: string; details?: unknown }): TestResult {
  try {
    const result = fn();
    if (typeof result === 'boolean') {
      return {
        name,
        passed: result,
        message: result ? 'PASS' : 'FAIL',
      };
    }
    return {
      name,
      passed: result.passed,
      message: result.message,
      details: result.details,
    };
  } catch (error) {
    return {
      name,
      passed: false,
      message: `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

function describe(suiteName: string, tests: TestResult[]): TestSuiteResult {
  const passed = tests.filter(t => t.passed).length;
  const failed = tests.filter(t => !t.passed).length;

  return {
    suiteName,
    passed,
    failed,
    results: tests,
  };
}

// ============================================================
// TEST SUITE 1: Profile Completeness
// ============================================================
function testProfileCompleteness(): TestSuiteResult {
  const tests: TestResult[] = [];

  // Test 1.1: All profiles have required fields
  tests.push(test('All profiles have required identity fields', () => {
    for (const profile of testProfiles) {
      if (!profile.id || !profile.username || !profile.email || !profile.full_name) {
        return {
          passed: false,
          message: `Profile ${profile.full_name || 'UNKNOWN'} missing identity fields`,
        };
      }
    }
    return { passed: true, message: 'All profiles have identity fields' };
  }));

  // Test 1.2: All profiles have professional info
  tests.push(test('All profiles have professional information', () => {
    for (const profile of testProfiles) {
      if (!profile.headline || !profile.bio || !profile.professional_role) {
        return {
          passed: false,
          message: `Profile ${profile.full_name} missing professional info`,
        };
      }
    }
    return { passed: true, message: 'All profiles have professional info' };
  }));

  // Test 1.3: All profiles have media URLs
  tests.push(test('All profiles have avatar and banner URLs', () => {
    for (const profile of testProfiles) {
      if (!profile.avatar_url || !profile.banner_url) {
        return {
          passed: false,
          message: `Profile ${profile.full_name} missing media URLs`,
        };
      }
    }
    return { passed: true, message: 'All profiles have media URLs' };
  }));

  // Test 1.4: All profiles have diaspora information
  tests.push(test('All profiles have diaspora-specific fields', () => {
    for (const profile of testProfiles) {
      if (!profile.diaspora_status || !profile.diaspora_networks?.length || !profile.country_of_origin) {
        return {
          passed: false,
          message: `Profile ${profile.full_name} missing diaspora info`,
          details: {
            diaspora_status: profile.diaspora_status,
            diaspora_networks: profile.diaspora_networks,
            country_of_origin: profile.country_of_origin,
          },
        };
      }
    }
    return { passed: true, message: 'All profiles have diaspora info' };
  }));

  // Test 1.5: All profiles have external links
  tests.push(test('All profiles have at least 3 external links', () => {
    for (const profile of testProfiles) {
      let linkCount = 0;
      if (profile.website_url) linkCount++;
      if (profile.linkedin_url) linkCount++;
      if (profile.twitter_url) linkCount++;
      if (profile.instagram_url) linkCount++;
      if (profile.github_url) linkCount++;

      if (linkCount < 3) {
        return {
          passed: false,
          message: `Profile ${profile.full_name} has only ${linkCount} external links`,
        };
      }
    }
    return { passed: true, message: 'All profiles have sufficient external links' };
  }));

  // Test 1.6: Validation scores
  tests.push(test('All profiles score 100% on completeness validation', () => {
    const validation = validateAllProfiles(testProfiles);
    if (!validation.allPassing) {
      return {
        passed: false,
        message: `Average score: ${validation.summary.averageScore}%`,
        details: validation.summary,
      };
    }
    return { passed: true, message: 'All profiles at 100% completeness' };
  }));

  // Test 1.7: Test account flags
  tests.push(test('All profiles have test account flags set', () => {
    for (const profile of testProfiles) {
      if (!profile.is_seeded || !profile.is_test_account || !profile.auto_connect_enabled) {
        return {
          passed: false,
          message: `Profile ${profile.full_name} missing test flags`,
          details: {
            is_seeded: profile.is_seeded,
            is_test_account: profile.is_test_account,
            auto_connect_enabled: profile.auto_connect_enabled,
          },
        };
      }
    }
    return { passed: true, message: 'All profiles have test flags' };
  }));

  return describe('Profile Completeness', tests);
}

// ============================================================
// TEST SUITE 2: Content Rendering
// ============================================================
function testContentRendering(): TestSuiteResult {
  const tests: TestResult[] = [];

  // Test 2.1: Post count per profile
  tests.push(test('Each profile has at least 5 posts', () => {
    const profileIds = Object.values(TEST_PROFILE_IDS);
    for (const profileId of profileIds) {
      const profilePosts = testPosts.filter(p => p.author_id === profileId);
      if (profilePosts.length < 5) {
        return {
          passed: false,
          message: `Profile ${profileId} has only ${profilePosts.length} posts`,
        };
      }
    }
    return { passed: true, message: 'All profiles have 5+ posts' };
  }));

  // Test 2.2: Post type variety
  tests.push(test('Posts include all required types (text, image, video, link)', () => {
    const postTypes = new Set(testPosts.map(p => p.post_type));
    const requiredTypes = ['text', 'update', 'image', 'video', 'link', 'question', 'celebration'];

    for (const type of requiredTypes) {
      if (!Array.from(postTypes).some(t => t === type || (type === 'text' && ['update', 'question', 'celebration'].includes(t)))) {
        return {
          passed: false,
          message: `Missing post type: ${type}`,
          details: { presentTypes: Array.from(postTypes) },
        };
      }
    }
    return { passed: true, message: 'All post types present' };
  }));

  // Test 2.3: Posts validation
  tests.push(test('All posts pass validation', () => {
    const invalidPosts: string[] = [];
    for (const post of testPosts) {
      const validation = validatePost(post);
      if (!validation.valid) {
        invalidPosts.push(`Post by ${post.author_id}: ${validation.issues.join(', ')}`);
      }
    }
    if (invalidPosts.length > 0) {
      return {
        passed: false,
        message: `${invalidPosts.length} invalid posts`,
        details: invalidPosts,
      };
    }
    return { passed: true, message: 'All posts valid' };
  }));

  // Test 2.4: Story count
  tests.push(test('Each profile has at least 2 stories', () => {
    const profileIds = Object.values(TEST_PROFILE_IDS);
    for (const profileId of profileIds) {
      const profileStories = testStories.filter(s => s.author_id === profileId);
      if (profileStories.length < 2) {
        return {
          passed: false,
          message: `Profile ${profileId} has only ${profileStories.length} stories`,
        };
      }
    }
    return { passed: true, message: 'All profiles have 2+ stories' };
  }));

  // Test 2.5: Story type variety
  tests.push(test('Stories include all types (impact, update, spotlight, photo_essay)', () => {
    const storyTypes = new Set(testStories.map(s => s.story_type));
    const requiredTypes = ['impact', 'update', 'spotlight', 'photo_essay'];

    for (const type of requiredTypes) {
      if (!storyTypes.has(type)) {
        return {
          passed: false,
          message: `Missing story type: ${type}`,
          details: { presentTypes: Array.from(storyTypes) },
        };
      }
    }
    return { passed: true, message: 'All story types present' };
  }));

  // Test 2.6: Stories validation
  tests.push(test('All stories pass validation', () => {
    const invalidStories: string[] = [];
    for (const story of testStories) {
      const validation = validateStory(story);
      if (!validation.valid) {
        invalidStories.push(`Story "${story.title}": ${validation.issues.join(', ')}`);
      }
    }
    if (invalidStories.length > 0) {
      return {
        passed: false,
        message: `${invalidStories.length} invalid stories`,
        details: invalidStories,
      };
    }
    return { passed: true, message: 'All stories valid' };
  }));

  // Test 2.7: Image posts have image URLs
  tests.push(test('Image posts have valid image URLs', () => {
    const imagePosts = testPosts.filter(p => p.post_type === 'image');
    for (const post of imagePosts) {
      if (!post.image_url || !post.image_url.startsWith('http')) {
        return {
          passed: false,
          message: 'Image post missing valid image_url',
        };
      }
    }
    return { passed: true, message: 'All image posts have URLs' };
  }));

  // Test 2.8: Video posts have video metadata
  tests.push(test('Video posts have video metadata', () => {
    const videoPosts = testPosts.filter(p => p.post_type === 'video');
    for (const post of videoPosts) {
      if (!post.link_url || !post.link_metadata?.is_video) {
        return {
          passed: false,
          message: 'Video post missing video metadata',
        };
      }
    }
    return { passed: true, message: 'All video posts have metadata' };
  }));

  // Test 2.9: Link posts have link info
  tests.push(test('Link posts have title and description', () => {
    const linkPosts = testPosts.filter(p => p.post_type === 'link');
    for (const post of linkPosts) {
      if (!post.link_url || !post.link_title) {
        return {
          passed: false,
          message: 'Link post missing link info',
        };
      }
    }
    return { passed: true, message: 'All link posts have info' };
  }));

  return describe('Content Rendering', tests);
}

// ============================================================
// TEST SUITE 3: Interaction Flows
// ============================================================
function testInteractionFlows(): TestSuiteResult {
  const tests: TestResult[] = [];

  // Test 3.1: Connection count
  tests.push(test('Test connections exist between profiles', () => {
    if (testConnections.length < 5) {
      return {
        passed: false,
        message: `Only ${testConnections.length} connections defined`,
      };
    }
    return { passed: true, message: `${testConnections.length} connections defined` };
  }));

  // Test 3.2: Connections validation
  tests.push(test('All connections pass validation', () => {
    const invalidConnections: string[] = [];
    for (const conn of testConnections) {
      const validation = validateConnection(conn);
      if (!validation.valid) {
        invalidConnections.push(`${conn.requester_id} -> ${conn.recipient_id}: ${validation.issues.join(', ')}`);
      }
    }
    if (invalidConnections.length > 0) {
      return {
        passed: false,
        message: `${invalidConnections.length} invalid connections`,
        details: invalidConnections,
      };
    }
    return { passed: true, message: 'All connections valid' };
  }));

  // Test 3.3: Connection status variety
  tests.push(test('Connections include accepted and pending statuses', () => {
    const statuses = new Set(testConnections.map(c => c.status));
    if (!statuses.has('accepted')) {
      return { passed: false, message: 'No accepted connections' };
    }
    if (!statuses.has('pending')) {
      return { passed: false, message: 'No pending connections' };
    }
    return { passed: true, message: 'Both statuses present' };
  }));

  // Test 3.4: No self-connections
  tests.push(test('No self-connections exist', () => {
    for (const conn of testConnections) {
      if (conn.requester_id === conn.recipient_id) {
        return { passed: false, message: 'Self-connection found' };
      }
    }
    return { passed: true, message: 'No self-connections' };
  }));

  // Test 3.5: Connection messages present
  tests.push(test('All connections have meaningful messages', () => {
    for (const conn of testConnections) {
      if (!conn.message || conn.message.length < 20) {
        return {
          passed: false,
          message: 'Connection missing meaningful message',
        };
      }
    }
    return { passed: true, message: 'All connections have messages' };
  }));

  return describe('Interaction Flows', tests);
}

// ============================================================
// TEST SUITE 4: Auto-Connect Logic
// ============================================================
function testAutoConnectLogic(): TestSuiteResult {
  const tests: TestResult[] = [];

  // Test 4.1: Auto-connect flags
  tests.push(test('All test profiles have auto_connect_enabled', () => {
    for (const profile of testProfiles) {
      if (!profile.auto_connect_enabled) {
        return {
          passed: false,
          message: `Profile ${profile.full_name} missing auto_connect_enabled`,
        };
      }
    }
    return { passed: true, message: 'All profiles have auto_connect_enabled' };
  }));

  // Test 4.2: Test email domain
  tests.push(test('All test profiles use test email domain', () => {
    for (const profile of testProfiles) {
      if (!profile.email.endsWith('@dna-platform.test')) {
        return {
          passed: false,
          message: `Profile ${profile.full_name} using non-test email: ${profile.email}`,
        };
      }
    }
    return { passed: true, message: 'All profiles use test email domain' };
  }));

  // Test 4.3: Test profile ID format
  tests.push(test('All test profiles use test ID prefix', () => {
    for (const profile of testProfiles) {
      if (!profile.id.startsWith('test-profile-')) {
        return {
          passed: false,
          message: `Profile ${profile.full_name} has non-standard ID: ${profile.id}`,
        };
      }
    }
    return { passed: true, message: 'All profiles use test ID prefix' };
  }));

  // Test 4.4: Safeguard flags consistency
  tests.push(test('Test flags are consistent (seeded, test_account, auto_connect)', () => {
    for (const profile of testProfiles) {
      if (profile.is_seeded !== profile.is_test_account) {
        return {
          passed: false,
          message: `Profile ${profile.full_name} has inconsistent test flags`,
        };
      }
    }
    return { passed: true, message: 'Test flags are consistent' };
  }));

  return describe('Auto-Connect Logic', tests);
}

// ============================================================
// TEST RUNNER
// ============================================================
function runAllTests(): void {
  console.log('\n========================================');
  console.log('DNA Platform - Seeded Test Profiles');
  console.log('Functional Test Suite');
  console.log('========================================\n');

  const suites: TestSuiteResult[] = [
    testProfileCompleteness(),
    testContentRendering(),
    testInteractionFlows(),
    testAutoConnectLogic(),
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    console.log(`\n[${suite.suiteName}]`);
    console.log('-'.repeat(40));

    for (const result of suite.results) {
      const status = result.passed ? 'PASS' : 'FAIL';
      const icon = result.passed ? '✓' : '✗';
      console.log(`  ${icon} ${result.name}: ${status}`);

      if (!result.passed && TEST_CONFIG.VERBOSE && result.details) {
        console.log(`    Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    }

    console.log(`\n  Results: ${suite.passed} passed, ${suite.failed} failed`);

    totalPassed += suite.passed;
    totalFailed += suite.failed;
  }

  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Total Tests: ${totalPassed + totalFailed}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);
  console.log('========================================\n');

  // Exit with appropriate code
  if (totalFailed > 0) {
    console.log('❌ Some tests failed. Please review and fix issues.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed! Seeded profiles are ready.\n');
    process.exit(0);
  }
}

// Run tests
runAllTests();
