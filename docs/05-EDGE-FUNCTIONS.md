# DNA Platform Edge Functions

## Overview
Edge Functions run on Deno runtime via Supabase. They handle backend logic, external API calls, and scheduled tasks.

## Current Edge Functions

### `send-universal-email`
**Purpose**: Send emails via Resend API

**Features**:
- Admin notification emails
- User confirmation emails
- Template support

**Files**:
- `index.ts` - Main handler
- `emailService.ts` - Email sending service
- `emailTemplates.ts` - Email templates

**Environment Variables**:
- `RESEND_API_KEY` - Resend API key

**Usage**:
```typescript
supabase.functions.invoke('send-universal-email', {
  body: { type: 'admin_notification', data: {...} }
})
```

## Planned Edge Functions

### `engagement-reminders`
Automated user engagement nudges (3-day, 7-day, 14-day).

### `engagement-analytics`
Calculate engagement metrics and health scores.

### `adin-matcher`
AI-driven user/opportunity matching.

## Configuration

**File**: `supabase/config.toml`

```toml
[functions.send-universal-email]
verify_jwt = false
```
