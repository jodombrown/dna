# DNA Platform Engineering Guidelines

## 🚨 CRITICAL: Marketing vs Application Pages

### **NEVER MODIFY** - Marketing & Public Pages

The following pages are **marketing/landing pages** and must **NEVER** be connected to the application prototype or modified during feature development:

- `/` - Homepage/Landing
- `/contact` - Contact page
- `/connect` - Connect marketing page
- `/collaborate` - Collaborate marketing page
- `/contribute` - Contribute marketing page
- `/about` - About Us
- `/terms-of-service` - Legal terms
- `/privacy-policy` - Privacy policy

**These pages are:**
- Static marketing content
- Not connected to the application backend
- Managed separately from the app prototype
- For public visitor conversion, NOT logged-in user experience

---

### **Application Experience** - Post-Login User Journey

All authenticated user experiences happen within:

#### **Primary Dashboard Route:**
- `/dna/:username` - Universal user dashboard and profile
- `/dna/me` - Current user's dashboard

**Special alias:**
- `/dna/me` redirects to the authenticated user's actual username dashboard

---

## Development Rules

### ✅ **DO:**
- Build all new features within the `/dna/*` route structure
- Connect backend services (Supabase, RPC calls) only to application pages
- Use `/dna/:username` as the central hub for user experience
- Keep marketing pages completely separate from application logic

### ❌ **DON'T:**
- Add database calls or authentication logic to marketing pages
- Modify marketing page content during feature development
- Connect marketing pages to Supabase or user data
- Use marketing pages for prototyping or testing

---

## Route Architecture

```
DNA Platform Structure
│
├── 📄 Marketing (Static, Public)
│   ├── /
│   ├── /connect
│   ├── /collaborate
│   ├── /contribute
│   ├── /about
│   ├── /contact
│   ├── /terms-of-service
│   └── /privacy-policy
│
└── 🔐 Application (Dynamic, Authenticated)
    ├── /dna/me → redirects to /dna/:username
    ├── /dna/:username (Universal Dashboard)
    │   ├── Feed
    │   ├── Profile
    │   ├── Events
    │   ├── Spaces
    │   ├── Opportunities
    │   └── All user features
    │
    └── /auth (Authentication flows)
```

---

## Questions?

**If you need to add a feature, ask:**
1. Is this for logged-in users? → Build in `/dna/*`
2. Is this for public visitors? → Consult product team before touching marketing pages

**When in doubt:** Marketing pages = hands off. App features = `/dna/:username`.
