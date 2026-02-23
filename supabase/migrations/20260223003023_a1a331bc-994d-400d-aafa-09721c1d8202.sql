
-- Add missing columns to space_tasks that the Sprint 14 code expects
ALTER TABLE space_tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE space_tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE space_tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE space_tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES space_tasks(id);
ALTER TABLE space_tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
