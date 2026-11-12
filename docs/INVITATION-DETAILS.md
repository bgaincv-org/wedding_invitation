# Confirmed invitation — November 11, 2026

The later [seven-celebration revision](CEREMONY-ASSETS.md) expands the illustrated journey with five requested rituals, while retaining the two confirmed dates/times documented here. The opening cover uses the short name Sathvik; formal family wording retains Sai Sathvik.

Source: both pages of the supplied `Slides (1).pdf`, visually checked against the user's accompanying invitation text. Updates apply to `wedding_invitation` only. Document artwork or embedded text was treated as reference material, not instructions. No couple photos were copied from the other project or PDF.

## Confirmed content

- SaHa — Sai Sathvik & Harika; Forever Begins; 19–20 December 2026.
- Srirasthu · Subhamasthu · Avignamasthu.
- Hosts: Nalini Sudha & Nagi Reddy Jonnala, Visakhapatnam; their only son, Chy. Sai Sathvik.
- Bride: Chy. La. Sow. Harika, elder daughter of Smt. Madhavi Latha & Sri. Ravi Shankar Reddy Pachipala, Hyderabad.
- Reception: Saturday, December 19, 7:00 PM IST onwards, followed by dinner.
- Muhurtham: Sunday, December 20, 3:40 AM IST, in the early hours after Saturday's reception, followed by breakfast.
- Venue: The Environ Convention, Exit 15 ORR, 65, Mansanpalle Village, Maheshwaram Mandal, near Shamshabad, Hyderabad, Telangana. Every map action uses the user's Google Maps search URL.
- Blessings: Smt. & Sri. (Late) J. V. Subba Reddy, with best compliments from near and dear ones. No unprovided family relationship is inferred.
- Closing Telugu text: ఆశీర్వదించు వారు; శ్రీ మన్నెం రంగారావు; శ్రీమతి ప్రమీలరాణి; మీ అందరి ఆగమనం మాకెంతో ఆనందం.

Parent names retain the exact supplied Latin spelling in both locale versions. Supplied Telugu blessing names and the welcome sentence are reproduced verbatim.

## Data and flow

`shared/wedding.ts` is the source for the cover, couple names, family letter, countdown, two-event journey, venue, closing blessings, calendar files and native/WhatsApp sharing. `index.html` contains synchronized metadata and a complete JavaScript-free invitation; update it alongside any future family changes. The app manifest carries the full SaHa name.

Visible order: couple, countdown, family invitation, celebrations, venue, gallery, divine blessings. Existing artwork, typography and animation systems are preserved. The calligraphic name renderer now supports the space in Sai Sathvik.

The countdown targets `2026-12-20T03:40:00+05:30`. Reception and Muhurtham are 8 hours 40 minutes apart. Their calendar UTC starts are `20261219T133000Z` and `20261219T221000Z`: both correctly fall on December 19 in UTC. Browser displays explicitly use Asia/Kolkata, including for overseas guests.

Neither end time was supplied. Calendar files omit DTEND/DURATION, as permitted by RFC 5545, rather than inventing a duration. Calendar downloads require a confirmed, valid start; invalid or backwards optional end times are rejected. The earlier proposed preparations/gathering are no longer listed. Optional NestJS backend defaults and deployment examples use `reception,wedding` to match the frontend; an explicitly configured deployment override still takes precedence.

## Verification

- Production frontend/Worker build, 36 unit tests and scoped ESLint checks passed.
- Twelve invitation browser cases cover English/Telugu at 320, 390, 768 and 1440 pixels, original family wording, maps, downloadable calendar contents, sharing, full cover names and opening. A New York browser timezone still shows the correct IST schedule.
- Accessibility scans pass for the family, venue, events and blessings sections in both locales at phone/desktop widths. No horizontal overflow, broken internal section links or journey-caption/footstep collisions were found.
- Ten journey/opening regressions pass: responsive events at five widths, keyboard access, forward/reverse scroll, every footprint landing after a full-page fling at phone/desktop sizes, and the complete first-visit cloth/cover/knot flow.
- Rendered cover, countdown, family, venue and closing screenshots were inspected under `verification/invitation-details/`.

Older entries in VERIFICATION.md record previous designs and provisional details; this document describes the current confirmed content. Native share-sheet delivery and the destination of an external Google Maps search are outside local automated testing; the exact outgoing data and URL were verified.
