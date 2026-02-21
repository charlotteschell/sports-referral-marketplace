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
- [x] Write vitest tests for dual offer types (B2B/Consumer)
- [x] Write vitest tests for regions and hubs

## Sport Vacations & Expanded Categories
- [x] Add "Sport Vacations" as a new sport category
- [x] Expand "Trail Running" to "Running" covering road, trail, ultra running
- [x] Add "Sport Vacation Provider" as a new business type
- [x] Seed sport vacation businesses in key locations

## Dual Referral Offer Types
- [x] Add offerType field to referralOffers (B2B vs Individual Consumer)
- [x] Update referral offer creation form with offer type selection
- [x] Update referral offers listing to filter/display by offer type
- [x] Update business profile to show both B2B and individual offers separately
- [x] B2B offers: for businesses looking to collaborate or send customers
- [x] Individual offers: for consumers looking for services (claimable by referred customers)

## Geographic Focus - Endurance Sports Hubs
- [x] Add region/hub fields to location data
- [x] Seed Canadian hubs (Whistler, Banff, Mont-Tremblant, etc.)
- [x] Seed US hubs (Boulder, Park City, Bend, Moab, etc.)
- [x] Seed European hubs - Dolomites (Cortina, Bolzano, Val Gardena)
- [x] Seed European hubs - Pyrenees (Andorra, Bagnères-de-Luchon, Girona)
- [x] Seed European hubs - Mallorca (Palma, Sóller, Pollença)
- [x] Seed European hubs - Alps (Chamonix, Zermatt, Innsbruck)
- [x] Update directory filters to browse by region/hub
- [x] Update landing page to showcase geographic hubs

## Frontend Updates
- [x] Update landing page sport categories to include Sport Vacations and Running
- [x] Update directory page filters for new categories and regions
- [x] Update referral offers page with B2B vs Individual tabs
- [x] Update business profile page for dual offer types
- [x] Update manage offers page for dual offer types

## SEO Fixes
- [x] Add meta description tag (50-160 characters)
- [x] Add meta keywords tag

## Login Flow
- [x] Note: Manus OAuth handles authentication (Google, etc.) - custom email/password not supported by platform
- [x] Login flow is clear and accessible via header Sign In button

## Branding
- [x] Add "Powered by RARE Labs" under SportConnect branding in header and footer

## Business Data Enrichment
- [x] Research real contact info, websites, and ratings for all 51 listed businesses
- [x] Add website URL field to business schema (already existed)
- [x] Add Google rating and review count fields to business schema
- [x] Update database with researched data (names, websites, emails, descriptions, ratings)
- [x] Display Google ratings on directory cards and business profiles
- [x] Show website links on business profile headers

## Submit Your Business Form
- [x] Create businessSubmissions database table for pending submissions
- [x] Add db helpers for creating and listing submissions
- [x] Add tRPC router for submitting a business and admin review
- [x] Build Submit Your Business form page with all required fields
- [x] Add form validation (name, email, sport category, business type, location)
- [x] Add navigation links to the Submit form from header, footer, and landing page CTAs
- [x] Send owner notification when a new submission arrives
- [x] Write vitest tests for the submission flow (9 new tests, 40 total pass)

## Sample Offer Labels & Community Messaging
- [x] Add isSample flag to referralOffers schema
- [x] Mark existing seeded offers as sample offers in database
- [x] Display "Sample Offer" badge on sample referral offers in directory and profiles
- [x] Add community messaging: encourage owners to claim listing and publish real incentives for free
- [x] Add messaging on referral offers page about free community platform
