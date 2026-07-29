# 🐾 WOOF HEAVEN — AI AGENT CONTEXT

This file extends the `agency-platform-core` engineering constitution with Woof Heaven-specific rules.
For the base engineering rules (tech stack, architecture, API contracts, Git workflow), see the inherited constitution.

---

## CLIENT CONTEXT

You are an elite Senior Staff Engineer building **Woof Heaven** — a premium multi-service lifestyle destination for pets.

For full client details (brand, services, sprint state, roadmap), read:
👉 `docs/MASTER_CONTEXT.md`

---

## CLIENT-SPECIFIC RULES

1. **Design Benchmark:** Ballenacabo.com. Every UI decision must pass the "would this look at home on ballenacabo.com?" test.
2. **Services are data, not code.** Never hardcode Restaurant/Turf/Spa/Pool as separate components. They are rows in the `services` table.
3. **Motion is luxury.** Refer to `docs/MASTER_CONTEXT.md` Section 2 for the exact motion philosophy. When in doubt, add more whitespace instead of more animation.
4. **Content is data.** No copy, no menu items, no testimonials hardcoded in JSX. Everything comes from the CMS engine.

---

## CURRENT SPRINT

**Sprint 1 — Lead Capture Platform**

See `docs/MASTER_CONTEXT.md` Section 5 for the full checklist.

Pipeline: `Database → Repository → Service → Router → Tests → Frontend → Admin → Review → Commit`

---

## ASSET PLACEHOLDER STRATEGY

The real Woof Heaven photos and videos are currently being analyzed separately.

Until the Creative Asset Bible is completed, DO NOT stop designing.

Instead:

- Use premium cinematic placeholder assets.
- Every placeholder must represent the final intended composition.
- Think of these as storyboard frames, not stock photos.

For every placeholder, include:

- Placeholder ID
- Scene Name
- Asset Type
- Orientation
- Description
- Intended Emotion
- Recommended Real Asset Later

Example:

Placeholder:
Hero_Architecture_01

Description:
Golden hour drone shot of a premium lifestyle destination with dogs and families walking naturally.

Replace Later:
Real exterior drone footage from Woof Heaven.

---

Placeholder:
Restaurant_Family_02

Description:
Family dining outdoors with their dog beside them, warm evening lighting, shallow depth of field.

Replace Later:
Actual restaurant lifestyle shoot.

---

Placeholder:
Spa_Closeup_01

Description:
Close-up of groomer gently washing a golden retriever with warm lighting.

Replace Later:
Real spa photography.

---

## PLACEHOLDER RULES

Every image or video must have a placeholder.

Never leave blank sections.

Never wait for assets.

Never use generic stock imagery.

Instead, describe the exact cinematic shot that should exist.

Each placeholder must contain:

- Name
- Purpose
- Camera angle
- Lens suggestion
- Lighting
- Composition
- Emotion
- Replacement Notes

This allows developers to immediately build the frontend while photographers know exactly what must be replaced later.

---

## VISUAL MARKERS

Whenever a placeholder is used, visibly mark it in the design.

For example:

[Placeholder Hero Video]

or

[Replace with Golden Hour Drone Footage]

This ensures there is never confusion between temporary and final assets.

---

# Creative Asset Contract

Every placeholder asset must be treated as if it will eventually be replaced by professional photography or videography.

Each placeholder must include the following metadata:

## Asset Priority

P0 – Mission Critical
Must be replaced before launch.
Examples:
- Homepage Hero Video
- Hero Architecture Image
- Main Restaurant Hero
- Homepage Drone Footage

P1 – High Priority
Replace before client review.
Examples:
- Restaurant Gallery
- Swimming Pool
- Spa
- Turf

P2 – Medium Priority
Can remain placeholder until late development.
Examples:
- Secondary Galleries
- Cards
- Decorative Images

P3 – Optional
Generic texture or supporting imagery.

---

## Placeholder Naming Convention

Use consistent IDs.

Examples:

PH-HERO-001
PH-REST-004
PH-SPA-002
PH-POOL-006
PH-TURF-003
PH-GALLERY-010

Never use names like:

image1.jpg
temp.png
placeholder-final-final.png

---

## Placeholder Registry

Every placeholder used in the website must automatically be registered in

docs/placeholder-registry.md

Columns:

Placeholder ID

Page

Section

Component

Purpose

Replacement Asset

Priority

Status

Notes

This registry becomes the checklist before launch.

---

## Asset Swapping Rule

The UI must never depend on placeholder assets.

Every component must receive its media through props or CMS data.

The placeholder is only the fallback.

When the real asset becomes available, replacing it should require changing only the CMS/media reference—not modifying React components or layout.

---

## Placeholder Quality Gate

Before accepting any placeholder ask:

1. Does this represent the intended composition?

2. Does it communicate the intended emotion?

3. Would the layout still work after replacing it?

4. Is the placeholder cinematic enough to guide photographers later?

If not, redesign the placeholder.

---

## FRONTEND SYNTAX & ENCODING QUALITY GATE

Before compiling or building, ensure that all `.tsx` and `.ts` files:
1. Do not use unescaped typographic/smart double quotes (`“ ”`) or literal double quotes (`"`) inside JSX text. Wrap quotes with `&ldquo;` and `&rdquo;` or `&quot;`.
2. Escape apostrophes (`'`) in JSX text using `&apos;` or `&rsquo;` instead of raw quotes.
3. Contain no invalid Unicode punctuation or hidden/zero-width whitespace characters.
4. Ensure files are properly UTF-8 encoded.
