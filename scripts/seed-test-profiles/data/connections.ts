/**
 * DNA Platform - Test Connections Data
 *
 * Pre-established connections between test profiles to enable
 * engagement testing and interaction flow validation.
 *
 * Connection network:
 * - All 5 profiles are interconnected
 * - Mix of accepted and pending statuses
 * - Enables testing of mutual connections, network features
 *
 * NON-PRODUCTION: All connections marked for test accounts only
 */

import { TEST_PROFILE_IDS } from '../constants';

export interface TestConnection {
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
}

export const testConnections: TestConnection[] = [
  // ============================================================
  // Amara's Connections (Fintech)
  // ============================================================

  // Amara -> Kwame (Accepted) - Fintech-Energy collaboration
  {
    requester_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    recipient_id: TEST_PROFILE_IDS.KWAME_ENERGY,
    status: 'accepted',
    message: 'Hi Kwame! I\'ve been following your solar energy work in Ghana. AfriPay is exploring financial solutions for energy access - would love to discuss potential collaboration on pay-as-you-go solar financing.',
  },

  // Amara -> Fatima (Accepted) - Fintech-Culture collaboration
  {
    requester_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    recipient_id: TEST_PROFILE_IDS.FATIMA_CULTURE,
    status: 'accepted',
    message: 'Fatima, your work promoting African artists is inspiring! I\'m interested in how AfriPay could help facilitate international art sales and artist payments. Let\'s connect!',
  },

  // Amara -> Zara (Accepted) - Fintech-EdTech collaboration
  {
    requester_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    recipient_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    status: 'accepted',
    message: 'Hi Zara! Saw your MIT Tech Review feature - congrats! I think there\'s interesting overlap between financial literacy and LearnAfrica. Would love to explore adding fintech education content.',
  },

  // ============================================================
  // Kwame's Connections (Clean Energy)
  // ============================================================

  // Kwame -> David (Accepted) - Energy-Health collaboration
  {
    requester_id: TEST_PROFILE_IDS.KWAME_ENERGY,
    recipient_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    status: 'accepted',
    message: 'David, your work on healthcare infrastructure in East Africa aligns perfectly with our solar solutions for health facilities. Let\'s discuss how we can work together on rural health electrification.',
  },

  // Kwame -> Zara (Accepted) - Energy-Education collaboration
  {
    requester_id: TEST_PROFILE_IDS.KWAME_ENERGY,
    recipient_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    status: 'accepted',
    message: 'Zara, our Solar Schools project in Ghana has transformed education outcomes. I\'d love to share learnings and explore how LearnAfrica content could complement electrified schools.',
  },

  // ============================================================
  // Fatima's Connections (Culture)
  // ============================================================

  // Fatima -> David (Pending) - Culture-Health potential
  {
    requester_id: TEST_PROFILE_IDS.FATIMA_CULTURE,
    recipient_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    status: 'pending',
    message: 'Hi David! I\'m exploring how art therapy could complement digital health initiatives. Your work in East Africa is impressive - would love to discuss cultural approaches to health and wellbeing.',
  },

  // Fatima -> Zara (Accepted) - Culture-Education collaboration
  {
    requester_id: TEST_PROFILE_IDS.FATIMA_CULTURE,
    recipient_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    status: 'accepted',
    message: 'Zara, LearnAfrica could be a great platform for art education! I\'d love to discuss developing African art history and creative content for your students.',
  },

  // ============================================================
  // David's Connections (Healthcare)
  // ============================================================

  // David -> Amara (Pending) - Health-Fintech potential
  {
    requester_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    recipient_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    status: 'pending',
    message: 'Amara, health financing is a major barrier to care in Africa. AfriPay\'s infrastructure could enable micro health insurance and savings products. Let\'s connect to explore possibilities!',
  },

  // David -> Zara (Accepted) - Health-Education collaboration
  {
    requester_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    recipient_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    status: 'accepted',
    message: 'Zara, health education is crucial for our telemedicine programs. Would love to discuss how LearnAfrica could help train community health workers and educate patients.',
  },

  // ============================================================
  // Zara's Connections (Education)
  // All outgoing connections from Zara - completing the network
  // ============================================================

  // Note: Zara already has incoming connections from all others
  // This creates a fully connected network for testing
];

export default testConnections;
