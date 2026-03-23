Design a modern, clean, enterprise-grade web application UI in React for a product called "SmartKnowledge".

Context:
SmartKnowledge is a knowledge capture and transmission platform designed to preserve expert knowledge from senior employees and make it accessible to new hires using AI (audio transcription + semantic search + RAG chatbot).

Design goals:
- Professional, minimalist, corporate (inspired by Atos design system)
- Clean UX for non-technical users
- High readability and accessibility
- Modular and scalable UI
- Dashboard-oriented experience

Color palette (Atos-inspired):
- Primary: Deep blue (#003A8F)
- Secondary: Light blue (#00A3E0)
- Background: Very light grey (#F5F7FA)
- Cards: White (#FFFFFF)
- Accent: Soft cyan / teal
- Text: Dark grey (#1F2937)

Typography:
- Sans-serif modern (Inter or equivalent)
- Clear hierarchy (H1, H2, body, captions)

Layout:
- Left vertical navigation bar (collapsible)
- Top header bar with:
  - Search
  - User profile
  - Notifications
- Main content area with cards and tables

Core pages to design:

1. Login Page
- Clean centered card
- Logo + "SmartKnowledge"
- Email + password fields
- CTA button "Login"
- Subtle background gradient

2. Dashboard
- KPI cards:
  - Number of interviews
  - Transcriptions completed
  - Indexed knowledge
- Recent interviews list
- Quick actions:
  - New interview
  - Upload audio
  - Ask a question

3. Interviews Management
- Table view with:
  - Title
  - Date
  - Status (Recorded / Transcribed / Indexed)
  - Actions (Transcribe 🎙️, Vectorize 🔍, Delete)
- Filters (date, status, user)
- Button: "New Interview"

4. Interview Detail Page
- Audio player
- Transcript panel (editable)
- Action buttons:
  - Transcribe
  - Vectorize
- Metadata panel (author, date, tags)

5. Knowledge Base (RAG Chat)
- Chat interface (like ChatGPT)
- Input box at bottom
- Messages:
  - User questions
  - AI answers
- Sidebar:
  - Sources used
  - Related interviews

6. User Management (Admin)
- Table of users
- Roles (Admin / User)
- Create / delete user
- Simple modal forms

Components:
- Reusable cards
- Buttons (primary, secondary, danger)
- Status badges
- Modal dialogs
- Toast notifications
- File upload drag & drop

UX details:
- Smooth hover effects
- Subtle shadows
- Rounded corners (8px–12px)
- Loading states (skeletons)
- Empty states with illustrations

React requirements:
- Component-based architecture
- Tailwind CSS styling
- Clean and production-ready code
- Responsive design (desktop-first, tablet compatible)

Optional:
- Dark mode variant
- Micro-interactions (Framer Motion)

Output:
- High-fidelity UI mockups
- React component structure
- Design system (colors, spacing, components)