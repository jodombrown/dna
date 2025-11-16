# ADA Phase 3 - M4: Signals + Embeddings Setup

## Overview

M4 establishes the foundational ML infrastructure for DNA's personalization engine. This milestone introduces interaction tracking, vector embeddings, and similarity-based recommendations.

## Objectives

1. ✅ Capture meaningful user interactions across all 5Cs
2. ✅ Generate user embeddings based on behavior and profile
3. ✅ Generate entity embeddings for events, spaces, needs, stories, profiles, and projects
4. ✅ Provide similarity APIs for recommendations

## Database Schema

### Tables Created

#### `user_interactions`
Tracks all user interactions for ML training.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `entity_type` (TEXT: event, space, need, story, profile, project, post, community)
- `entity_id` (UUID)
- `interaction_type` (TEXT: view, click, cta, scroll, join, connect_click, rsvp, apply, share, save, like, comment)
- `context_c` (TEXT: Connect, Convene, Collaborate, Contribute, Convey, Messages, Home, Profile, Discover)
- `weight` (FLOAT, default 1.0)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `user_id`
- `entity_type, entity_id`
- `created_at DESC`
- `context_c`
- `interaction_type`

#### `user_vectors`
Stores user embeddings.

**Columns:**
- `user_id` (UUID, PK, FK → auth.users)
- `vector` (JSONB - array of floats)
- `dimension` (INTEGER, default 32)
- `source` (TEXT: interactions, profile, hybrid)
- `updated_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

#### `entity_vectors`
Stores entity embeddings.

**Columns:**
- `id` (UUID, PK)
- `entity_type` (TEXT)
- `entity_id` (UUID)
- `vector` (JSONB - array of floats)
- `dimension` (INTEGER, default 32)
- `source` (TEXT: tags, metadata, text, hybrid)
- `updated_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

**Unique Constraint:** `(entity_type, entity_id)`

## Database Functions

### `cosine_similarity(vec1 JSONB, vec2 JSONB)`
Calculates cosine similarity between two vectors.

**Returns:** FLOAT (0-1)

### `get_similar_users(target_user_id UUID, limit_count INTEGER)`
Finds users with similar embeddings.

**Returns:** TABLE (user_id UUID, similarity_score FLOAT)

### `get_similar_entities(target_entity_type TEXT, target_entity_id UUID, limit_count INTEGER)`
Finds entities with similar embeddings.

**Returns:** TABLE (entity_type TEXT, entity_id UUID, similarity_score FLOAT)

## Services

### `interactionLogger.ts`
Handles interaction tracking with batching and buffering.

**Features:**
- Singleton pattern
- Automatic buffering (flushes every 5s or when 10 items buffered)
- Weight-based importance scoring
- Helper functions for common interactions

**Usage:**
```typescript
import { logInteraction } from '@/services/interactionLogger';

// Log a view
logInteraction.view('event', eventId, 'Convene');

// Log a CTA click
logInteraction.cta('space', spaceId, 'Collaborate');
```

### `embeddingService.ts`
Generates and manages embeddings.

**Key Functions:**
- `generateUserEmbedding(userId)` - Creates user vector from interactions + profile
- `generateEntityEmbedding(entityType, entityId)` - Creates entity vector from metadata
- `saveUserVector(userId, source)` - Persists user embedding
- `saveEntityVector(entityType, entityId, source)` - Persists entity embedding
- `cosineSimilarity(vec1, vec2)` - Calculates similarity

**Embedding Strategy:**
- 32-dimensional vectors
- Hash-based feature encoding
- Normalized vectors
- Interaction-weighted for users
- Tag/metadata-based for entities

## Hooks

### `useInteractionLogger()`
React hook for logging interactions with automatic context detection.

**Usage:**
```typescript
const { log, context } = useInteractionLogger();

// Automatically detects context from route
log.view('event', eventId);
log.click('space', spaceId);
```

### `useLogEntityView(entityType, entityId, enabled)`
Automatically logs entity views on component mount.

**Usage:**
```typescript
useLogEntityView('event', eventId);
```

### `useSimilarUsers(userId, limit)`
Finds similar users.

**Returns:** `{ data, isLoading, error }`

### `useSimilarEntities(entityType, entityId, limit)`
Finds similar entities.

**Returns:** `{ data, isLoading, error }`

### `usePersonalizedRecommendations(entityType, limit)`
Gets personalized recommendations for current user.

**Returns:** `{ data, isLoading, error }`

## Integration Points

### Where to Log Interactions

1. **Feed (PostCard)**
   - View: When post enters viewport
   - Like: When user likes post
   - Comment: When user comments
   - Share: When user shares

2. **Events (EventCard, EventDetailView)**
   - View: When event card/detail viewed
   - Click: When event clicked
   - RSVP: When user RSVPs
   - CTA: When related CTAs clicked

3. **Spaces (SpaceCard, SpaceDetailView)**
   - View: When space viewed
   - Join: When user joins
   - CTA: When "Create Event from Space" etc. clicked

4. **Needs (NeedCard, NeedDetailView)**
   - View: When need viewed
   - Apply: When user applies
   - CTA: Cross-5C CTAs

5. **Profiles (ProfileCard, ProfileView)**
   - View: When profile viewed
   - Connect: When connection request sent

6. **Cross-5C CTAs**
   - All CTA clicks should be logged with `cta` type

## Interaction Weights

| Interaction Type | Weight | Meaning |
|-----------------|--------|---------|
| view | 0.5 | Low signal |
| click | 1.0 | Medium signal |
| like | 1.5 | Medium-high signal |
| comment | 2.0 | High signal |
| cta | 2.0 | High signal |
| rsvp | 2.5 | Very high signal |
| share | 2.5 | Very high signal |
| join | 3.0 | Strongest signal |

## RLS Policies

All tables have RLS enabled:

- **user_interactions**: Users can only insert/view their own
- **user_vectors**: Users can view their own, system can manage all
- **entity_vectors**: All authenticated users can view, system can manage

## Performance Considerations

1. **Batching**: Interactions are buffered before DB writes
2. **Indexes**: All frequently queried columns indexed
3. **Stale Time**: React Query caches similarity results for 5 minutes
4. **Limit Results**: All similarity queries default to top 10

## Next Steps (M5)

- Build ranking APIs using these embeddings
- Implement feed personalization
- Create recommendation endpoints for each 5C
- Integrate similarity scoring into discovery surfaces

## Acceptance Criteria

- [x] All tables created with indexes
- [x] Interaction logger service implemented
- [x] Embedding generation working
- [x] Similarity functions operational
- [x] React hooks for logging available
- [x] Documentation complete

## Notes

- Embeddings are lightweight (32-dim) for speed
- Can scale to more sophisticated models later
- Current implementation is privacy-preserving
- All vector operations happen server-side via Postgres functions
