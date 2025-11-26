# WDIR - Wood Destroying Insect Report

iOS app for generating industry-standard WDIR (Wood Destroying Insect Report) inspections with licensing management.

## Project Structure

```
wdir/
├── backend/        # Next.js API + Supabase (license management)
├── ios/           # iOS app (SwiftUI)
└── docs/          # Documentation and specifications
```

## Tech Stack

**Backend:**
- Next.js 15 (App Router)
- Supabase (PostgreSQL)
- Stripe (payments)
- Vercel (hosting)

**iOS:**
- SwiftUI
- Core Data (local storage)
- PDFKit (report generation)

## Features

- Industry-standard WDIR form
- Auto-fill preferences
- License management (individual + team)
- Offline-first (local storage)
- PDF generation
- Photo attachments
- Native iOS sharing

## Setup

See individual README files in each directory:
- [Backend Setup](./backend/README.md)
- [iOS Setup](./ios/README.md)

## License

Proprietary - Texas Termite Pest and Critter Control
