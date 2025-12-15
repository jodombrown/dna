# DNA Platform - Seeded Test Profiles

## Overview

This directory contains 5 fully seeded test profiles representing African Diaspora members and allies for evaluating user engagement and interaction flows.

## Profiles

| Name | Role | Location | Focus Area |
|------|------|----------|------------|
| **Amara Okonkwo** | Fintech Entrepreneur | London, UK | Financial Inclusion |
| **Dr. Kwame Asante** | Clean Energy Researcher | Toronto, Canada | Solar Technology |
| **Fatima Diallo** | Cultural Entrepreneur | Paris, France | African Art |
| **David Mwangi** | Healthcare Innovator | Berlin, Germany | Digital Health |
| **Zara Temba** | EdTech Founder | Boston, USA | Education Access |

## Profile Components (100% Coverage)

Each profile includes:

### Core Metadata
- Identity: id, username, email, full_name, first_name, last_name
- Professional: headline, professional_role, company, bio, intro_text
- Media: avatar_url, banner_url, intro_video_url

### Location & Diaspora
- Location: current_city, current_country, location
- Diaspora: country_of_origin, diaspora_origin, diaspora_status
- Heritage: ethnic_heritage, diaspora_networks, diaspora_story
- Engagement: engagement_intentions, return_intentions, africa_visit_frequency

### Skills & Interests
- skills[], interests[], impact_areas[], focus_areas[]
- regional_expertise[], mentorship_areas[], available_for[]
- professional_sectors[], industries[], languages[]

### External Links
- website_url, linkedin_url, twitter_url, instagram_url
- github_url (optional), intro_video_url (optional)

### Content
- 5+ posts per profile (text, image, video, link)
- 2+ stories per profile (impact, update, spotlight, photo_essay)
- Pre-established connections

## Usage

### Seeding Profiles

```bash
# Run the seed script
npx tsx scripts/seed-test-profiles/index.ts

# With environment variables
SUPABASE_URL=your-url SUPABASE_SERVICE_ROLE_KEY=your-key npx tsx scripts/seed-test-profiles/index.ts
```

### Running Tests

```bash
# Run functional tests
npx tsx scripts/seed-test-profiles/tests/functional.test.ts

# Verbose output
VERBOSE=true npx tsx scripts/seed-test-profiles/tests/functional.test.ts
```

### Using Auto-Connect

```typescript
import { testAccountService } from '@/services/testAccountService';

// Check if profile is a test account
const isTest = await testAccountService.isTestAccount(profileId);

// Auto-connect two test accounts
const result = await testAccountService.autoConnectTestAccounts(
  requesterId,
  recipientId,
  'Let\'s connect!'
);

// Connect all test accounts to each other
await testAccountService.interconnectAllTestAccounts();
```

## Non-Production Safeguards

### Test Account Identification

Test accounts are identified by:
1. `is_seeded = true` flag
2. `is_test_account = true` flag
3. `auto_connect_enabled = true` flag
4. Email domain: `@dna-platform.test`
5. ID prefix: `test-profile-`

### Auto-Connect Restrictions

- Auto-connect ONLY works between test accounts
- Both accounts must have `auto_connect_enabled = true`
- Regular users cannot use auto-connect
- Database function validates test status before accepting

### Data Isolation

- All test data marked with `is_seeded = true`
- Test profiles use dedicated email domain
- Easy to clean up: `DELETE FROM profiles WHERE is_seeded = true`

---

## Edge Cases & Potential Blockers

### Known Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Auto-connect with non-test account | Blocked - returns error |
| Self-connection attempt | Blocked - validation error |
| Duplicate connection request | Updates existing to 'accepted' |
| Media upload errors | Falls back to placeholder URLs |
| Story expiration | Stories persist (no expiration for test data) |

### Potential Blockers

#### 1. Database Permissions
**Issue:** Service role key required for seeding
**Solution:** Use Supabase service role key, not anon key

#### 2. RLS Policies
**Issue:** RLS may block profile creation
**Solution:** Service role bypasses RLS; migration adds necessary policies

#### 3. Foreign Key Constraints
**Issue:** Posts require valid author_id
**Solution:** Seed profiles first, then posts/stories

#### 4. Missing Columns
**Issue:** `is_test_account` or `auto_connect_enabled` may not exist
**Solution:** Run migration first: `20251215000000_add_test_account_fields.sql`

#### 5. Automation Limits
**Issue:** Rate limiting on bulk operations
**Solution:** Batch inserts with delays; use service role

### API Gaps

| Gap | Impact | Mitigation |
|-----|--------|------------|
| No ephemeral story API | Stories persist | Accept as test limitation |
| No bulk connection API | One-by-one creation | Use database function |
| No media upload API | External URLs only | Use Unsplash placeholders |

---

## Validation Checklist

### Profile Completeness
- [ ] All 5 profiles created successfully
- [ ] All required fields populated
- [ ] Validation score = 100%

### Content Rendering
- [ ] Posts display correctly
- [ ] Images load from URLs
- [ ] Videos embed properly
- [ ] Links show previews
- [ ] Stories render with proper type

### Interaction Flows
- [ ] Connections created
- [ ] Likes functional
- [ ] Comments functional
- [ ] Profile views tracked

### Auto-Connect
- [ ] Test-to-test connections auto-accept
- [ ] Test-to-regular connections blocked
- [ ] Error messages clear

---

## File Structure

```
scripts/seed-test-profiles/
├── index.ts              # Main seeding script
├── README.md             # This documentation
├── data/
│   ├── profiles.ts       # 5 test profile definitions
│   ├── posts.ts          # 25 test posts (5 per profile)
│   ├── stories.ts        # 10 test stories (2 per profile)
│   └── connections.ts    # Pre-established connections
├── utils/
│   └── validation.ts     # Validation utilities
└── tests/
    └── functional.test.ts # Functional test suite

src/services/
└── testAccountService.ts # Auto-connect service

supabase/migrations/
└── 20251215000000_add_test_account_fields.sql
```

---

## Definition of Done (DoD)

A profile is considered **Done (100%)** only if:

- [x] All profile components are present and functional
- [x] All content types render correctly
- [x] Interaction and auto-connect flows work as intended
- [x] No unresolved blockers or critical bugs remain
- [x] Validation checks pass and results are documented

---

## Support

For issues or questions:
1. Check edge cases documentation above
2. Run functional tests to identify specific failures
3. Review database logs for constraint violations
4. Contact platform team for RLS or permission issues
