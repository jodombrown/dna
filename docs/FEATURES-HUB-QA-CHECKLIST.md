# Features Hub QA Checklist

Use this as your quick pass across the entire documentation system to ensure everything is clean, consistent, and working.

## 1. Routing QA
- [ ] `/documentation/features` loads correctly
- [ ] `/documentation/features/:slug` loads each detail page
- [ ] Invalid slugs return a clean "Feature Not Found" state
- [ ] Browser back/forward navigation works
- [ ] Internal links work (no broken URLs)

## 2. Features Registry QA
- [ ] All features are present in `features.config.ts`
- [ ] Each slug matches the filename exactly
- [ ] Every entry has:
  - [ ] name
  - [ ] slug
  - [ ] pillar/category
  - [ ] shortTagline
  - [ ] status
  - [ ] overviewOrder
- [ ] Filters work based on registry metadata

## 3. Features Hub QA
- [ ] All features appear in the grid
- [ ] Filter chips correctly filter visible items
- [ ] Search bar (if implemented) returns expected results
- [ ] Feature cards link to correct detail pages
- [ ] Status badges (Live / Beta / Coming Soon) display correctly
- [ ] Sorting by overviewOrder works

## 4. Feature Detail Pages QA

For each page:
- [ ] Hero section displays correctly
- [ ] All headers are properly styled
- [ ] Spacing between sections is clean
- [ ] Bullets render correctly
- [ ] No cut-off paragraphs
- [ ] Related features links work
- [ ] No leftover placeholder text

## 5. Content Consistency QA
- [ ] Tone matches DNA style (warm, clear, human)
- [ ] Sections follow the standard template
- [ ] Mini stories are present
- [ ] FAQs exist and are helpful
- [ ] "Related features" links are accurate

## 6. Accessibility QA
- [ ] Headings follow proper semantic order
- [ ] All text readable on mobile
- [ ] Buttons/links have accessible labels

## 7. Performance QA
- [ ] Hub loads quickly
- [ ] Feature pages render with no layout shift
- [ ] No unnecessary API calls

---

Once every box is checked, your documentation system is production ready at a world-class level.
