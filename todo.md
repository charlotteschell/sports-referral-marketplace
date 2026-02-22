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

## Business Dashboard Redesign
- [x] Add backend analytics endpoint for dashboard metrics (referrals sent/received, conversion rate, top partners)
- [x] Add backend endpoint for referral status breakdown (pending, contacted, converted, expired)
- [x] Redesign dashboard with KPI metric cards (total referrals, conversion rate, active offers, pending)
- [x] Add referral status breakdown with progress bars
- [x] Add top referral partners section
- [x] Add referral activity tabs (recent, sent, received) with status badges and quick actions
- [x] Add quick action buttons (send referral, create offer, edit business, browse directory)
- [x] Responsive design for mobile
- [x] Write tests for new dashboard analytics endpoints (2 new tests)

## Unclaim & Delete Business
- [x] Add backend endpoint to unclaim a business (resets to unclaimed state, deactivates offers)
- [x] Add backend endpoint to delete a business profile (soft delete, deactivates offers)
- [x] Add unclaim button with confirmation dialog in dashboard
- [x] Add delete profile button with confirmation dialog in dashboard
- [x] Write tests for unclaim and delete endpoints (9 new tests, 51 total pass)

## Admin Panel for Business Submissions
- [x] Build admin panel page with submission list (filterable by status: all, pending, approved, rejected)
- [x] Add submission detail view with all submitted business info (expandable cards)
- [x] Add approve action that creates a new business listing from submission data
- [x] Add reject action with optional review notes
- [x] Add admin-only navigation link visible to admin users (amber "Admin" button in header)
- [x] Add route to App.tsx and protect with admin role check
- [x] Existing tests cover submission review endpoints (51 tests pass)

## Searchable Business Dropdown & Edit Offers
- [x] Add backend business autocomplete search endpoint (search by name, city, region)
- [x] Add backend endpoint to update/edit an existing referral offer
- [x] Replace manual business ID input with searchable dropdown in SendReferral page
- [x] Dropdown shows matching businesses as user types with name, location, icon
- [x] Debounced search with loading state and clear selection
- [x] Add edit button on each existing offer in ManageOffers page
- [x] Inline edit form with save/cancel for editing offer details
- [x] Write tests for autocomplete and offer update endpoints (6 new tests, 57 total pass)

## Claim Your Business CTA on Directory Listings
- [x] Add prominent "Claim Your Business" button on each unclaimed directory card
- [x] Button links to the business profile page (or login if not authenticated)
- [x] Visually distinguish unclaimed listings with amber CTA and border
- [x] Claimed/verified businesses do not show the claim button

## Case-Insensitive Dropdowns
- [x] Make all search/filter dropdowns case-insensitive (search, autocomplete, filters)

## Admin Approval Workflow
- [x] Add approvalStatus field to businesses (pending, approved, rejected)
- [x] Claimed businesses require admin approval before going live
- [x] Newly added businesses require admin approval
- [x] Send notification to admin when a business is claimed or added
- [x] Admin dashboard shows pending claims and new businesses needing approval
- [x] Admin can approve or reject claimed/new businesses

## Super Admin Controls
- [x] Admin can hide any business from public view (isAdminHidden)
- [x] Admin can hide any business's incentive/offer from public view
- [x] Admin can take down businesses at any time
- [x] Admin dashboard shows controls for hiding/showing businesses and offers

## Business Owner Visibility Controls
- [x] Business owners can hide/show their own incentives (ManageOffers toggle)
- [x] Business owners can hide their business from public view without deleting (Dashboard toggle)
- [x] Hidden businesses and offers are not shown in public directory/listings
- [x] Dashboard shows visibility toggle for each business and offer

## Category Fixes & New Businesses
- [x] Audit and fix all category mismatches in seeded businesses (e.g. Sa Calobra = cycling club)
- [x] Add Alaro Cycling Club (https://www.alarocyclingclub.com/en)
- [x] Add North Wind Cycles (https://www.northwindcycles.com/)
- [x] Add The Doctrine Training Ltd. (https://thedoctrine.ca/)
- [x] Add Score Nutrition (https://scorenutrition.ca/)
- [x] Add Trail Run Adventures (www.trailrunadventures.com)
- [x] Add Anna Frost Coaching (https://www.trailrunadventures.com/coaching)
- [x] Add Personal Peak Coaching (https://personalpeak.ca/trainer/travis-brown/)
- [x] Add Cyclo Claudia Coaching and Guiding (https://www.cycloclaudia.com/home)
- [x] Add Inspire Health & Performance (https://inspireperformance.ca/) - sports physio

## Context-Smart Search
- [x] Make search bar context-smart - typing a region shows all relevant results
- [x] Search across business name, city, region, hub, and business type
- [x] Improve autocomplete to include region/hub matches

## Featured Business Section
- [x] Build Featured Business section on the landing page
- [x] Display curated featured businesses with branding

## Testing (New)
- [x] Write tests for context-smart search
- [x] Write tests for featured businesses endpoint
- [x] All 64 tests passing

## Incentives on Directory Cards
- [x] Show referral incentives directly on business cards in the directory page
- [x] Add sample incentives for featured businesses

## Phone Number Formatting
- [x] Automatically format phone numbers to readable format throughout the site

## Email Verification for Claims & Submissions
- [x] When claiming a business, require email with business domain
- [x] Send verification code to business domain email
- [x] Verify code before allowing claim submission
- [x] When adding new business, also require email verification
- [x] Both flows must inform user that submission is subject to admin approval

## Admin Panel Renaming
- [x] Rename admin sections: "New Business Submissions Pending Approval"
- [x] Rename admin sections: "Claim Existing Businesses Pending Approval"

## Email Confirmations
- [x] Send email confirmation when claim/submission is successfully submitted
- [x] Send email confirmation when claim/submission is approved (encourage adding incentives)

## About Page
- [x] Create About page with volunteer-driven messaging
- [x] Add content about unpaid volunteers passionate about sport
- [x] Add messaging about patience with bugs and delays
- [x] Add messaging about future donations/payments
- [x] Add creative images to match content
- [x] Add navigation link to About page

## Therapists → Sport Psychologists
- [x] Rename "therapists" to "sport psychologists" throughout the site

## Featured Business Carousel
- [x] Add rotation/arrows to scroll featured businesses if they don't fit on one page
- [x] Show claimed/unclaimed/verified status on featured business cards
- [x] Show sample incentives on featured business cards

## Business Logos
- [x] Research and add real logos for businesses in the directory
- [x] Display logos on directory cards and business profiles

## Google Reviews Enhancement
- [x] Show "Google Review" label with star rating and review count
- [x] Link to Google My Business page for each business
- [x] Show for both claimed and unclaimed businesses

## Referral Tracking & Verification System
- [x] Add referral status tracking fields (pending, honored, disputed) to referrals table
- [x] Add consumer_claims table for consumers claiming SportConnect-exclusive offers
- [x] Add verification fields (honoring confirmation from both sides)
- [x] Add $ amount tracking to referrals for cashout calculations
- [x] Backend: B2B referral verification procedures (mark as honored/disputed by sender and receiver)
- [x] Backend: Consumer offer claim flow (sign up, claim offer, verify if honored)
- [x] Backend: Analytics queries for business dashboards (referrals received/honored, sent/cashed out, $ earned)
- [x] Backend: Analytics queries for consumer dashboards (offers claimed, incentives verified, $ saved)
- [x] Backend: Home page activity stats query (total referrals, $ exchanged, businesses active, etc.)
- [x] Frontend: Business dashboard - referrals received section with honor/dispute actions
- [x] Frontend: Business dashboard - referrals sent section with cashout tracking
- [x] Frontend: Business dashboard - analytics summary (total received, honored, sent, cashed out, $ made)
- [x] Frontend: Consumer dashboard - claimed offers list with verification status
- [x] Frontend: Consumer dashboard - analytics (total $ saved, incentives utilized)
- [x] Frontend: Home page activity tracker with seeded numbers
- [x] Seed database with realistic activity numbers for home page tracker

## Logo Upload for Business Owners
- [x] Allow business owners to upload a logo for their claimed business
- [x] Display uploaded logos on directory cards and business profiles

## Privacy Controls for Directory Cards
- [x] Show website URL on directory cards for claimed businesses
- [x] Show logos on directory cards
- [x] Hide emails and phone numbers from public view
- [x] Emails and phone numbers visible only to Admin and claimed business owners
- [x] Feature website and Google My Business link on business profiles

## Email Messaging System
- [x] Add "Email" button on business profiles (like Get in Touch)
- [x] Only clickable when user is logged in (prompt login if not)
- [x] Send email to business's registered email
- [x] Track "partnership emails exchanged" metric
- [x] Add metric to all data trackers and dashboards

## Multi-Select Filters
- [x] Allow multiple selection on sports category filter
- [x] Allow multiple selection on business type filter
- [x] Allow multiple selection on region filter
- [x] Convert Hub/Area to dropdown with multi-select
- [x] Allow "Add New" option on all dropdowns (subject to approval)
- [x] Admin dashboard to approve new category additions

## Support Ticket System
- [x] Create support ticket form (describe problem/feature request with screenshots)
- [x] Support ticket queue in Admin dashboard
- [x] Admin can set status: done, in backlog, in progress, in testing, launched
- [x] Send congratulation email to submitter when status is "Launched"

## Account Types
- [x] When logging in, ask user: consumer or business owner
- [x] Allow switching between account types
- [x] Support multiple accounts with same email

## Navigation Updates
- [x] Remove Home button (logo serves as home)
- [x] Add Support Ticket link to navigation

## Copywriting Overhaul
- [x] Remove excessive use of dashes (AI signal)
- [x] Make copy casual, funny, sporty, witty, human
- [x] Fix running image on homepage (currently shows skiing)
- [x] Update SportConnect logo to browser logo

## New Categories
- [x] Add "Supplement Retailer" business type with brand listings (Feed, Ketone IQ, Tailwind, Scratch, Momentus, Pillar)
- [x] Add "Bike Retailer" business type

## Send Referral Button
- [x] Add small "Send a Referral" button to directory cards and everywhere businesses are shown

## Get in Touch Email
- [x] Send Get in Touch emails to support@rarelabs.ai

## Seed Businesses
- [x] Seed all Google Maps businesses in Mallorca fitting categories
- [x] Seed all Google Maps businesses in Calgary area (Cochrane, Okotoks, Airdrie, Canmore, Banff, Bragg Creek)

## Brands / OEMs for Retailers
- [x] Add "brands carried" field to businesses for bike retailers and supplement retailers
- [x] Display brands on directory cards and business profiles for retailer types

## Referral Leaderboard Page
- [x] Backend: leaderboard query (top businesses by referral volume and $ earned)
- [x] Backend: leaderboard procedure in routers
- [x] Frontend: Leaderboard page with rankings table
- [x] Show top referring businesses by volume and earnings
- [x] Add gamification elements (badges, rank position)
- [x] Add navigation link to Leaderboard
- [x] Route registration in App.tsx

## Seed More Geographic Regions
- [x] Research and seed Colorado Front Range businesses (Denver, Boulder, Colorado Springs, Fort Collins)
- [x] Research and seed Pacific Northwest businesses (Portland, Seattle, Bend)
- [x] Research and seed Girona, Spain businesses (cycling, running, physio, nutrition)
- [x] Add new regions and hubs to the database
- [x] Add sample referral offers for all new businesses (217 new offers, 259 total)
- [x] Update footer and homepage region highlights with new regions
- [x] Update platform stats to reflect 175 businesses
- [x] All 84 tests still passing after seeding

## Sample Referral Activity Data for Leaderboard
- [x] Seed realistic referral records between businesses for leaderboard rankings
- [x] Include honored, pending, and disputed referrals with dollar amounts
- [x] Leaderboard should show real rankings with business names and stats

## Launch Countdown Timer
- [x] Add a clock/timer next to community activity stats showing time since launch
- [x] Gamify with messaging like "see how much we can help each other grow"

## New Categories: Cycling Cafes & Sports Restaurants
- [x] Add "Cycling Cafe" business type
- [x] Add "Sports Restaurant" business type
- [x] Research and seed real cycling cafes and sports-oriented restaurants in existing regions
- [x] Seed businesses from Colorado Front Range, Pacific Northwest, Girona, Mallorca, Calgary area (22 new businesses, 197 total)

## Email Button UX Changes
- [x] Remove email button from directory cards
- [x] Display email button only on main business profile page
- [x] Make email button more prominent on profile page with "Have a Better Idea?" CTA card
- [x] Add messaging: "Don't see a referral program you like or have a better partnership idea? Get in touch directly."

## Auto-Claim on Admin Approval
- [x] When a business owner submits a new business, auto-claim it to their account once admin approves
- [x] Link the submitter's user account to the business on approval

## Domain Email Verification
- [x] Email domain validated against website domain (allows common email providers as fallback)
- [x] Website URL is now required when submitting a business
- [x] Validate email domain matches website domain during submission

## Profile Edit Data Retention Fix
- [x] Fix bug: previously filled fields (sport category, business type) now retained with formInitialized flag
- [x] All fields retain their current values when opening the edit form
- [x] Pre-populate all form fields with existing business data

## Logo Upload Improvements
- [x] Allow business owners to easily upload logo when editing their profile (dedicated card at top of edit form)
- [x] Update directory cards to reflect logo changes instantly after upload (cache invalidation)

## Dashboard B2B Referral Tracking Fix
- [x] Fix bottom section of business dashboard: now shows B2B referrals sent with status tracking
- [x] Label updated to "B2B Referral Partnerships" with "Track referrals you've sent as a business partner"
- [x] Shows referral status (pending/contacted/converted/declined) with inline status update dropdown
- [x] Show referrals sent to other businesses with status tracking

## Signup Flow: Business Owner vs Sports Enthusiast
- [x] On first signup, prompt user to choose: business owner or sports enthusiast (Onboarding page)
- [x] Create distinct user flows for each account type
- [x] Business owners redirected to dashboard after onboarding
- [x] Sports enthusiasts redirected to directory after onboarding
- [x] Route added at /onboarding, wired in App.tsx

## Edit Business Form Improvements
- [x] Hub/Area field is now a dropdown populated from database, filtered by region
- [ ] Allow businesses to select multiple sport categories (future enhancement)
- [ ] Allow businesses to select multiple business types (future enhancement)
- [x] When bike retailer or supplement retailer is selected, show brands field immediately
- [x] Pre-populate all form fields with existing business data (fixed data retention bug with formInitialized flag)
- [x] Logo upload is easy with dedicated card at top of edit form, reflects changes instantly via cache invalidation

## Email Button on Profile - Owner View
- [x] Hide "Email Business" / "Have a Better Idea?" CTA when the business owner is viewing their own claimed business profile (already uses !isOwner condition)

## Add Business Form Improvements
- [x] When adding a business, if bike retailer or supplement retailer is selected, show brands field immediately
- [x] Hub/Area is now a dropdown in the submit business form, populated from API, filtered by region

## Google Maps / Google My Business Links
- [x] If business has Google reviews or a Google Maps/My Business page, link to it on their profile page
- [x] Make the Google Reviews card clickable to open their Google Maps listing
- [x] Auto-generate Google Maps search URL as fallback for businesses without explicit googleMapsUrl
- [x] Show 'Find on Google' card even for businesses without ratings but with a city

## Clear Sample Data on Business Claim
- [x] When a business is claimed by a real owner, remove all sample/seed referral data associated with that business
- [x] Remove sample referrals (both sent and received) for the claimed business
- [x] Remove sample consumer claims for the claimed business
- [x] Remove sample referral offers (isSample=true) for the claimed business
- [x] Cleanup runs on both: claimBusiness() and approveOrRejectBusiness(approved)
- [x] Leaderboard and analytics auto-recalculate since data is deleted from source tables

## Add Specific Business: Business Intrinsi Calgary
- [x] Research Business Intrinsi (physio and bike fit) in Calgary
- [x] Add to directory with correct details: 3519 18th St SW, Marda Loop, 820+ Google reviews, 4.9 rating
- [x] Added B2B offer (10% commission on bike fits) and consumer offer (15% off first bike fit)
- [x] Marked as featured business

## Directory Card Button Improvements
- [x] Make "Send a Referral" and "Claim This Business" buttons side by side on directory cards
- [x] Make both buttons more prominent: Send Referral is primary filled, Claim is amber outline
- [x] For claimed businesses, show "View Profile" button instead of Claim

## Navigation Signup/Signin Buttons
- [x] Next to "List Your Business", added "I'm an Enthusiast" button (with Mountain icon) that routes to onboarding
- [x] "Sign In" button shown for existing members (was already there, now more prominent in the 3-button layout)
- [x] Mobile menu also updated with all three options: Sign In, I'm an Enthusiast, List Your Business

## Info Button on Referrals Sent Stat
- [x] Add info button next to "Referrals Sent" on the homepage
- [x] Shows hover tooltip explaining sample data was seeded by builders, will be replaced with real referrals## Add Training Camps Business Type
- [x] Added "Training Camp" as a new business type category## Fix Duplicate Hubs/Areas
- [x] Merged Calgary Metropolitan Area -> Calgary, Palma de Mallorca -> Palma
- [x] Fixed RARE Cycling Club empty hub -> Calgary
- [x] No more duplicate hubs remain

## Demo-Verified Businesses Should Still Be Claimable
- [x] Distinguish between demo-verified (seeded data) and truly claimed (real owner) businesses
- [x] Demo-verified businesses show "Listed" badge (blue) instead of "Verified" (green)
- [x] Real business owners can still claim demo-listed businesses (Claim button shown)
- [x] "Verified" badge only shown when a real user has claimed the business (claimedByUserId not null)

## Rewrite Website Copy to Remove AI Patterns
- [x] Audit all user-facing copy on Home, About, Directory, Leaderboard, Dashboard, Onboarding, etc.
- [x] Rewrote Home.tsx: 18 copy edits (hero, stats, how it works, sports, hubs, business types, offers, featured, SEO)
- [x] Rewrote ReferralOffers.tsx: 5 copy edits (hero, banner, B2B/consumer explainers, bottom CTA)
- [x] Rewrote Onboarding.tsx: 6 copy edits (toasts, hero, card descriptions, feature lists)
- [x] Rewrote About.tsx: 3 copy edits (story, values, pricing note)
- [x] Rewrote SubmitBusiness.tsx: 1 copy edit (hero description)
- [x] Rewrote Leaderboard.tsx: 2 copy edits (empty state, bottom CTA)
- [x] Rewrote Footer.tsx: 1 copy edit (tagline)
- [x] Saved copywriting guidelines as a reusable skill for future tasks
