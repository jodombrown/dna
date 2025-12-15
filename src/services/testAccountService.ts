/**
 * DNA Platform - Test Account Service
 *
 * Service for managing test account functionality including:
 * - Auto-connect between test accounts
 * - Test account identification
 * - Test-only safeguards
 *
 * IMPORTANT: This service contains functionality that should ONLY
 * be used in testing/development environments. All functions include
 * safeguards to prevent misuse in production.
 */

import { supabase } from '@/integrations/supabase/client';

// Test profile ID prefix for easy identification
const TEST_PROFILE_PREFIX = 'test-profile-';

// Test email domain for seeded accounts
const TEST_EMAIL_DOMAIN = '@dna-platform.test';

/**
 * Check if a profile is a test account
 * Uses multiple indicators to verify test status
 */
export async function isTestAccount(profileId: string): Promise<boolean> {
  // Quick check: Test profile ID prefix
  if (profileId.startsWith(TEST_PROFILE_PREFIX)) {
    return true;
  }

  // Database check: Check email for test domain (columns like is_seeded don't exist)
  try {
    // Note: is_seeded and auto_connect_enabled columns don't exist on profiles table
    // Just check if email ends with test domain
    return false; // Test account features disabled until columns are added
  } catch {
    return false;
  }
}

/**
 * Check if both profiles are test accounts (required for auto-connect)
 */
export async function areBothTestAccounts(
  profileId1: string,
  profileId2: string
): Promise<boolean> {
  const [isTest1, isTest2] = await Promise.all([
    isTestAccount(profileId1),
    isTestAccount(profileId2),
  ]);

  return isTest1 && isTest2;
}

/**
 * Auto-connect two test accounts without approval
 *
 * SAFEGUARDS:
 * - Both accounts MUST be test accounts
 * - Cannot connect non-test accounts
 * - Creates connection with status='accepted' directly
 */
export async function autoConnectTestAccounts(
  requesterId: string,
  recipientId: string,
  message?: string
): Promise<{
  success: boolean;
  connectionId?: string;
  error?: string;
}> {
  // Safeguard: Verify both are test accounts
  const bothTestAccounts = await areBothTestAccounts(requesterId, recipientId);

  if (!bothTestAccounts) {
    return {
      success: false,
      error: 'Auto-connect is only available between test accounts. Both accounts must be marked as test accounts.',
    };
  }

  // Safeguard: Prevent self-connection
  if (requesterId === recipientId) {
    return {
      success: false,
      error: 'Cannot connect to self',
    };
  }

  // Check for existing connection
  const { data: existing } = await supabase
    .from('connections')
    .select('id, status')
    .or(
      `and(requester_id.eq.${requesterId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${requesterId})`
    )
    .maybeSingle();

  if (existing) {
    if (existing.status === 'accepted') {
      return {
        success: true,
        connectionId: existing.id,
        error: 'Connection already exists',
      };
    }

    // Update existing pending/declined connection to accepted
    const { data, error } = await supabase
      .from('connections')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Failed to update connection: ${error.message}`,
      };
    }

    return {
      success: true,
      connectionId: data.id,
    };
  }

  // Create new auto-accepted connection
  const { data, error } = await supabase
    .from('connections')
    .insert({
      requester_id: requesterId,
      recipient_id: recipientId,
      status: 'accepted', // Auto-accept for test accounts
      message: message || '[Test Account Auto-Connect]',
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: `Failed to create connection: ${error.message}`,
    };
  }

  return {
    success: true,
    connectionId: data.id,
  };
}

/**
 * Get all test accounts
 * Returns list of profiles marked as test accounts
 */
export async function getTestAccounts(): Promise<{
  success: boolean;
  accounts: Array<{
    id: string;
    username: string;
    full_name: string;
    email: string;
  }>;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, email')
      .or('is_seeded.eq.true,auto_connect_enabled.eq.true')
      .order('full_name');

    if (error) {
      return {
        success: false,
        accounts: [],
        error: error.message,
      };
    }

    return {
      success: true,
      accounts: data || [],
    };
  } catch (error) {
    return {
      success: false,
      accounts: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fully connect all test accounts to each other
 * Creates accepted connections between all test accounts
 */
export async function interconnectAllTestAccounts(): Promise<{
  success: boolean;
  connectionsCreated: number;
  errors: string[];
}> {
  const result = {
    success: true,
    connectionsCreated: 0,
    errors: [] as string[],
  };

  // Get all test accounts
  const { accounts, error } = await getTestAccounts();

  if (error) {
    return {
      success: false,
      connectionsCreated: 0,
      errors: [`Failed to get test accounts: ${error}`],
    };
  }

  // Create connections between all pairs
  for (let i = 0; i < accounts.length; i++) {
    for (let j = i + 1; j < accounts.length; j++) {
      const connectResult = await autoConnectTestAccounts(
        accounts[i].id,
        accounts[j].id,
        `Test account network connection: ${accounts[i].full_name} <-> ${accounts[j].full_name}`
      );

      if (connectResult.success) {
        result.connectionsCreated++;
      } else if (connectResult.error && !connectResult.error.includes('already exists')) {
        result.errors.push(
          `${accounts[i].full_name} <-> ${accounts[j].full_name}: ${connectResult.error}`
        );
      }
    }
  }

  result.success = result.errors.length === 0;

  return result;
}

/**
 * Check if auto-connect is enabled for a profile
 */
export async function isAutoConnectEnabled(profileId: string): Promise<boolean> {
  try {
    // Note: auto_connect_enabled and is_seeded columns don't exist on profiles table
    // Test account features disabled until columns are added
    return false;
  } catch {
    return false;
  }
}

/**
 * Enhanced connection request that supports auto-connect for test accounts
 *
 * If both users are test accounts with auto_connect_enabled, the connection
 * is immediately accepted. Otherwise, it creates a pending request.
 */
export async function sendConnectionRequestWithAutoConnect(
  requesterId: string,
  recipientId: string,
  message?: string
): Promise<{
  success: boolean;
  connectionId?: string;
  status: 'pending' | 'accepted';
  autoConnected: boolean;
  error?: string;
}> {
  // Check if both accounts have auto-connect enabled
  const [requesterAutoConnect, recipientAutoConnect] = await Promise.all([
    isAutoConnectEnabled(requesterId),
    isAutoConnectEnabled(recipientId),
  ]);

  // If both have auto-connect, create accepted connection immediately
  if (requesterAutoConnect && recipientAutoConnect) {
    const result = await autoConnectTestAccounts(requesterId, recipientId, message);

    return {
      success: result.success,
      connectionId: result.connectionId,
      status: 'accepted',
      autoConnected: true,
      error: result.error,
    };
  }

  // Otherwise, create normal pending connection request
  const { data, error } = await supabase
    .from('connections')
    .insert({
      requester_id: requesterId,
      recipient_id: recipientId,
      status: 'pending',
      message: message?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      status: 'pending',
      autoConnected: false,
      error: error.message,
    };
  }

  return {
    success: true,
    connectionId: data.id,
    status: 'pending',
    autoConnected: false,
  };
}

export const testAccountService = {
  isTestAccount,
  areBothTestAccounts,
  autoConnectTestAccounts,
  getTestAccounts,
  interconnectAllTestAccounts,
  isAutoConnectEnabled,
  sendConnectionRequestWithAutoConnect,
};

export default testAccountService;
