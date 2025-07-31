# DNA Platform Seeding Scripts

This directory contains scripts to seed the DNA platform database with sample data for development and testing.

## Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (found in Supabase Dashboard > Settings > API)

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Seed Script

```bash
npm run seed
```

## What Gets Seeded

The script creates realistic sample data including:

### Profiles (5 users)
- **Amara Okafor** - Fintech entrepreneur (Lagos, Nigeria)
- **Kwame Asante** - Tech event organizer (Toronto, Canada)  
- **Fatima Al-Rashid** - Renewable energy engineer (Cairo, Egypt)
- **David Mukasa** - Software architect (London, UK)
- **Aisha Diallo** - EdTech innovator (Dakar, Senegal)

### Posts (5 posts)
- Fintech adoption discussion
- Tech summit recap with media
- Solar project update
- Diaspora talent bridge announcement
- EdTech platform beta launch

### Events (5 events)
- Diaspora Investor Roundtable (Virtual)
- AfroTech Nairobi Meetup
- Renewable Energy Summit (Cape Town)
- Remote Work Webinar (Virtual)
- EdTech Innovation Workshop (Accra)

### Contribution Cards (5 projects)
- Solar for Schools (Ghana)
- Diaspora Talent Bridge (Pan-African)
- Rural Fintech Initiative (West Africa)
- Digital Learning Platform (Pan-African)
- Youth Innovation Fund (Pan-African)

### Contact Requests (5 connections)
- Various networking and collaboration requests between users

## Notes

- All seeded data is marked with `is_seeded: true` for easy identification
- Profile IDs are consistent across all related data
- Data represents realistic African diaspora network scenarios
- Financial amounts and dates are set for ongoing projects

## Cleanup

To remove all seeded data, you can use the reset function in the admin panel or run:

```sql
-- Remove all seeded data
DELETE FROM contact_requests WHERE is_seeded = true;
DELETE FROM contribution_cards WHERE is_seeded = true;  
DELETE FROM events WHERE is_seeded = true;
DELETE FROM posts WHERE is_seeded = true;
DELETE FROM profiles WHERE is_seeded = true;
```