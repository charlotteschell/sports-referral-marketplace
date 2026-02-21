# Project TODO

## Database & Backend
- [x] Design and implement business directory schema (businesses, categories, locations)
- [x] Design and implement referral offers schema
- [x] Design and implement referral tracking schema
- [x] Design and implement business claiming schema
- [x] Create database migration and apply SQL
- [x] Build tRPC routers for business CRUD operations
- [x] Build tRPC routers for referral offer management
- [x] Build tRPC routers for referral tracking
- [x] Build tRPC routers for business claiming workflow
- [x] Build tRPC router for directory search and filtering

## Design & Layout
- [x] Set up rugged outdoor design system (earthy tones, athletic typography)
- [x] Build global navigation with auth-aware header
- [x] Build responsive footer

## Landing Page
- [x] Hero section with messaging for both professionals AND enthusiasts
- [x] How it works section
- [x] Sport categories showcase (cycling, trail running, snowsports)
- [x] Business types showcase
- [x] Call-to-action sections
- [x] Featured businesses section (replaces testimonials)

## Business Directory
- [x] Directory listing page with search bar
- [x] Filter by sport category (cycling, trail running, snowsports)
- [x] Filter by location
- [x] Filter by business type (coach, bike shop, physio, etc.)
- [x] Business card components showing claimed vs unclaimed status
- [x] Pagination for directory results

## Business Profile Pages
- [x] Full business profile page layout
- [x] Claimed business: show full referral offerings and contact info
- [x] Unclaimed business: show limited info only (no contact, no referral offers)
- [x] "Claim Business" button for unclaimed businesses
- [x] "Edit Info" button only visible AFTER claiming
- [x] "Update B2B Offer" button only visible AFTER claiming

## Business Claiming Workflow
- [x] Claim business flow (user claims ownership)
- [x] Edit business info form (only for claimed business owners)
- [x] Business profile editing (description, contact, hours, etc.)

## Referral Offer System
- [x] Create referral offer form
- [x] Edit/delete referral offers
- [x] Display referral offers on claimed business profiles
- [x] Referral offer listing in directory

## Referral Tracking
- [x] Log referral form (business A sends customer to business B)
- [x] Referral history dashboard
- [x] Referral status tracking (pending, completed, etc.)
- [x] Basic analytics (referrals sent, received, conversion)

## User Authentication & Roles
- [x] Business owner accounts via Manus OAuth
- [x] Admin role support
- [x] Protected routes for business management
- [x] User dashboard showing owned businesses

## Testing
- [x] Write vitest tests for business CRUD operations
- [x] Write vitest tests for referral tracking
- [x] Write vitest tests for claiming workflow
