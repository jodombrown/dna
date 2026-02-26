

# Introduction Workflow — "Make Introduction"

## The Problem
Currently, clicking "Make Introduction" on a DIA insight card simply navigates to `/dna/messages?introduce=userId1,userId2`, which isn't handled by the Messages page at all. The user just lands in their inbox with no context or guidance.

## The Vision
A warm introduction is one of the most powerful networking actions. DNA should make this feel intentional, guided, and delightful — not just "open a group chat."

## How It Works (User Flow)

```text
1. User sees DIA card: "Introduce asakindele and donplayne?"
2. Clicks "Make Introduction"
3. An Introduction Modal opens (not navigation away)
4. Modal shows:
   - Both people's avatars, names, headlines side by side
   - Why DIA suggested this (shared skills, sectors, heritage)
   - A pre-drafted warm intro message the user can edit
   - Option to choose: Group thread vs. Separate messages
5. User reviews/edits and clicks "Send Introduction"
6. System creates a 3-person group conversation with the intro message
7. Both recipients get a notification: "[Your name] introduced you to [other person]"
8. Success screen with confetti + "Introduction sent!" + link to thread
```

## Detailed Design

### Step 1: IntroductionModal Component
A new modal component (`src/components/connect/IntroductionModal.tsx`) that receives both user profiles and renders:

- **Header:** "Make an Introduction" with the DIA spark icon
- **People Section:** Two profile mini-cards side by side showing avatar, name, headline, and location
- **Context Section:** A subtle "Why connect them?" blurb pulled from DIA metadata (shared skills, sectors, heritage regions, mutual spaces/events)
- **Message Composer:** A pre-filled textarea with a warm template like:
  > "Hey [PersonA] and [PersonB]! I wanted to connect you two — [PersonA], [PersonB] is [headline]. [PersonB], [PersonA] is [headline]. I think you'd have a lot to talk about!"
- **Send Mode Toggle:** Radio group — "Group introduction (recommended)" vs. "Introduce separately" (sends individual messages with context about the other person)
- **Send button** with loading state

### Step 2: Introduction Service (`src/services/introductionService.ts`)
Handles the backend logic:

- `sendGroupIntroduction(introducerId, personAId, personBId, message)`:
  - Creates a group conversation (type: `group`, origin_type: `introduction`) with all 3 participants
  - Sets conversation title: "Introduction: [PersonA] + [PersonB]"
  - Sends the intro message as the first message from the introducer
  - Creates notifications for both recipients (type: `introduction`)
  - Tracks the introduction in a new `introductions` table for analytics

- `sendSeparateIntroductions(introducerId, personAId, personBId, messageA, messageB)`:
  - Opens/creates 1:1 conversations with each person
  - Sends a tailored message to each mentioning the other

### Step 3: Database — `introductions` table
New table to track introductions for analytics, DIA learning, and preventing duplicate suggestions:

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| introducer_id | uuid | Who made the introduction |
| person_a_id | uuid | First person introduced |
| person_b_id | uuid | Second person introduced |
| conversation_id | uuid | The resulting conversation |
| intro_type | text | 'group' or 'separate' |
| status | text | 'sent', 'accepted' (both responded), 'connected' (they connected) |
| message | text | The introduction message |
| context | jsonb | Why DIA suggested this (shared attributes) |
| created_at | timestamptz | When introduced |

### Step 4: Update DIA Card Action
Change the `mutual_bridge` card in `connectCards.ts`:
- Instead of `type: 'navigate'`, use `type: 'custom'` with payload containing both user IDs and metadata
- The `DIAInsightCard` component handles the `custom` action type by opening the `IntroductionModal`

### Step 5: Notification Integration
When an introduction is sent, both recipients receive a notification:
- **Type:** `introduction`
- **Title:** "[Name] introduced you to [Other Name]"
- **Message:** A snippet of the intro message
- **Link:** Direct to the group conversation thread

### Step 6: Success State
After sending, show a brief success animation (confetti burst) with:
- "Introduction sent!"
- Mini preview of the thread
- "View conversation" link
- Auto-dismiss after 3 seconds

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/connect/IntroductionModal.tsx` | Create — the full modal UI |
| `src/services/introductionService.ts` | Create — introduction business logic |
| `src/services/dia/connectCards.ts` | Edit — change action type to `custom` with metadata |
| `src/components/dia/DIAInsightCard.tsx` | Edit — handle `custom` action type, open IntroductionModal |
| `supabase/migrations/xxx_create_introductions_table.sql` | Create — new table + RLS |
| `src/integrations/supabase/types.ts` | Update — add introductions table types |

## Key Design Decisions

1. **Modal, not navigation** — User stays in context; the introduction feels like a quick, delightful action, not a page change
2. **Pre-drafted message** — Reduces friction; the user just reviews and sends rather than composing from scratch
3. **Group thread preferred** — Creates a shared space where both people can immediately interact, rather than separate siloed messages
4. **Tracking table** — Prevents DIA from re-suggesting the same introduction and enables analytics on introduction success rates
5. **Notifications** — Both recipients know this is an intentional introduction, not just being added to a random group chat

