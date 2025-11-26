# Documentation

## Contents

- [DDR Analysis](./DDR_ANALYSIS.md) - FileMaker schema extraction and analysis
- [License Model](./LICENSE_MODEL.md) - License architecture and validation flow
- WDIR Specification - Industry-standard PDF format requirements

## FileMaker Migration

Original solution: FileMaker-based WDIR form
Target: iOS native app with Supabase backend

Key migration decisions:
- Reports stored locally (not in cloud)
- License details from server = source of truth
- Auto-fill from user preferences
- Offline-first PDF generation
