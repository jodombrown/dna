# DNA Documentation Maintenance Guide

Internal guide for maintaining the Features Documentation System.

## 1. When Adding a New Feature

1. Create a new markdown page at:
   ```
   /documentation/features/<slug>.md
   ```

2. Add a registry entry in `features.config.ts`:
   ```typescript
   {
     slug: "feature-slug",
     name: "Feature Name",
     pillar: "Connect", // or Convene, Collaborate, Contribute, Convey, Platform
     category: "Feature", // or Pillar, System
     status: "live", // or beta, coming-soon
     shortTagline: "One-line description.",
     oneLiner: "Slightly longer explanation of value.",
     audience: ["Members", "Partners"],
     overviewOrder: 16, // Next available number
   }
   ```

3. Follow the standard template:
   - Hero
   - What it is
   - What you can do
   - Behind the scenes
   - Steps
   - Mini stories
   - Related features
   - FAQs

4. Test the new route:
   - Navigate to `/documentation/features/[slug]`
   - Verify all sections render correctly

5. Check the Hub page:
   - Does the new card appear?
   - Is the category filter correct?
   - Is ordering correct?

---

## 2. When Updating an Existing Feature

1. Update the markdown page
2. Update the registry fields if needed
3. Confirm all links still work
4. Update `overviewOrder` if reordering
5. Optional: timestamp the change

---

## 3. When Removing a Feature

1. Remove registry entry from `features.config.ts`
2. Remove slug page file
3. Confirm Hub page no longer shows it
4. Confirm links don't break
5. Redirect old slug if necessary

---

## 4. Tone & Style Guidelines

### Voice Principles
- **Warm**: Speak like a trusted guide, not a technical manual
- **Clear**: Avoid jargon; explain complexity simply
- **Conversational**: Write like you're talking to a colleague
- **Purpose-driven**: Always connect features to diaspora impact
- **Action-focused**: Tell people what they can DO, not just what exists

### Content Structure
- Always include "what you can do"
- Always include real-world examples
- Honor global diaspora identities and contexts
- Keep paragraphs short (2-3 sentences max)
- Use bullets for scannable lists
- End with actionable next steps

### What to Avoid
- Technical jargon without explanation
- Overly formal language
- Assumptions about user knowledge
- Generic tech-speak
- Walls of text

---

## 5. Regular Documentation Health Checks

### Quarterly Review
- [ ] Scan Features Hub for outdated phrasing
- [ ] Confirm ADIN language matches current capabilities
- [ ] Refresh stories and examples with real user data
- [ ] Clean up broken internal links
- [ ] Verify all status badges are accurate
- [ ] Check for duplicate content across pages

### Annual Deep Dive
- [ ] Full content audit
- [ ] Update screenshots and visual examples
- [ ] Reorganize if new pillars or categories emerge
- [ ] Review information architecture
- [ ] Gather user feedback on documentation clarity

---

## 6. File Organization

```
/src/config/
  features.config.ts          # Single source of truth registry

/src/pages/documentation/
  FeaturesHub.tsx             # Main features index
  PlatformOverview.tsx        # Marketing overview
  [slug].tsx                  # Individual feature pages

/docs/
  FEATURES-HUB-QA-CHECKLIST.md
  FEATURES-HUB-ENHANCEMENTS-ROADMAP.md
  FEATURES-MAINTENANCE-GUIDE.md
  DOCUMENTATION-COMPLETION-ASSESSMENT.md
```

---

## 7. Common Pitfalls

### Registry Sync Issues
**Problem**: Feature exists but doesn't appear in Hub
**Solution**: Verify entry exists in `features.config.ts` with correct slug

### Broken Links
**Problem**: "Related features" links return 404
**Solution**: Double-check slug spelling matches registry exactly

### Inconsistent Ordering
**Problem**: Features appear in wrong order on Hub
**Solution**: Review `overviewOrder` values; ensure no duplicates

### Status Badge Confusion
**Problem**: Beta features marked as "live"
**Solution**: Regular quarterly review of status fields

---

## 8. Success Metrics

Track these to measure documentation health:
- Time to find feature information (< 30 seconds)
- User satisfaction with documentation clarity
- Number of support tickets related to "how does X work"
- Feature adoption rate after documentation publication

---

## 9. Team Roles

### Documentation Owner
- Quarterly health checks
- Content tone consistency
- Final approval on new pages

### Feature Teams
- Write initial feature documentation
- Update when features change
- Flag outdated content

### Product/Marketing
- Review for clarity and messaging alignment
- Provide real-world stories and examples
- Suggest enhancements

---

## 10. Emergency Procedures

### Broken Production Documentation
1. Identify the issue (broken link, missing page, incorrect info)
2. Create hotfix branch
3. Make minimal required change
4. Test locally
5. Deploy immediately
6. Document the issue in team log

### Mass Update Required
1. Create update plan with checklist
2. Batch changes by category
3. Test in staging environment
4. Deploy during low-traffic period
5. Monitor for issues post-deploy

---

**Last Updated**: January 2025  
**Maintained By**: DNA Documentation Team
