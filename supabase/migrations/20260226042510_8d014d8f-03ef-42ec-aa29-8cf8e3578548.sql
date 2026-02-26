
-- Delete all event-related data, then the events themselves
DELETE FROM event_reminder_logs;
DELETE FROM event_checkins;
DELETE FROM event_attendees;
DELETE FROM event_comments;
DELETE FROM event_reports;
DELETE FROM event_promo_codes;
DELETE FROM event_ticket_holds;
DELETE FROM event_tickets;
DELETE FROM event_waitlist;
DELETE FROM event_blasts;
DELETE FROM event_registrations;
DELETE FROM event_registration_questions;
DELETE FROM event_ticket_types;
DELETE FROM event_analytics;
DELETE FROM event_roles WHERE event_id IN (SELECT id FROM events);
DELETE FROM posts WHERE event_id IS NOT NULL;
DELETE FROM events;
