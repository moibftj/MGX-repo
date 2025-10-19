# LegalLetter AI - Development Plan

## MVP Implementation Strategy
Focus on core functionality with simplified features to ensure successful completion within 8 files limit.

## Core Files to Create/Modify (Max 8 files):

1. **src/pages/Index.tsx** - Main landing page with role-based navigation
2. **src/pages/Dashboard.tsx** - User dashboard for letter generation and management
3. **src/pages/AdminDashboard.tsx** - Admin panel for user/employee management
4. **src/pages/Auth.tsx** - Authentication page (login/signup with role selection)
5. **src/components/LetterGenerator.tsx** - AI letter generation component with 4-step timeline
6. **src/components/SubscriptionPlans.tsx** - Subscription plans with coupon support
7. **src/lib/supabase.ts** - Supabase client configuration and database functions
8. **index.html** - Update title and metadata

## Key Features (MVP):
- ✅ Role-based authentication (User, Employee, Admin)
- ✅ AI letter generation with mock Gemini API (simulated)
- ✅ 4-step animated timeline
- ✅ PDF generation using jsPDF
- ✅ Subscription plans with employee coupon system
- ✅ Basic admin dashboard
- ✅ Employee referral tracking
- ✅ Local storage for data persistence (no Supabase backend)

## Simplified Assumptions:
- Use localStorage for data persistence instead of Supabase
- Mock AI responses for letter generation
- Simulate email functionality
- Basic PDF generation without complex formatting
- Simplified commission calculation

## File Relationships:
- Index.tsx → Auth.tsx → Dashboard.tsx/AdminDashboard.tsx
- Dashboard.tsx → LetterGenerator.tsx, SubscriptionPlans.tsx
- All components use lib/supabase.ts for data operations