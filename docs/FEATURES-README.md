# DNA Features Catalog (Quick Share)

Use this with GPT or any LLM to generate plans, tickets, or documentation.

How to use
- Open docs/features-catalog.json and copy its entire contents.
- Paste into your GPT with a prompt like: “Here is the DNA features catalog JSON. Generate a prioritized roadmap and implementation tasks for the next sprint.”

What’s inside
- Product snapshot (current + planned features)
- Tech stack and routes
- Security posture (RLS-first) and SEO needs
- Gaps and next steps for immediate execution

Tips for prompts
- “Propose DB indexes and pagination for search based on this catalog.”
- “Draft an admin dashboard IA and policy checks.”
- “Write page-level SEO tags for /, /auth, and /dna/:username.”

Source of truth
- JSON file: docs/features-catalog.json
- Keep this file updated whenever you ship a new feature or change routes.
