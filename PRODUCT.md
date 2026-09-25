# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: Next.js 16 (App Router) on Webflow Cloud (Cloudflare Workers via OpenNext), started from the official `hello-world-next-app` starter. Chosen because it deploys to Webflow Cloud as-is and gives API routes for the dynamic parts. npm only (Webflow Cloud requirement).

## Users

Specialty-coffee enthusiasts: people who already know the vocabulary (origin, altitude, varietal, process, roast, SCA score, extraction) and want the full technical sheet of each coffee before choosing, plus how to brew it at home. Secondary audience: Webflow engineers judging the Nerdearla 2026 app contest.

## Product Purpose

Web app for a fictional specialty roaster/café, **Altura**. It does two things:
1. Tells the story of coffee from plant to cup (cherry, harvest, process, drying, roasting, grinding, extraction) as a scroll-driven narrative.
2. Presents the full menu ("la carta") with every coffee's complete sheet: origin, farm/region, altitude, varietal, process, roast level, tasting notes, aroma, acidity/body/sweetness, recommended grind per brew method, and a base recipe.

Success: an enthusiast can compare coffees and leave knowing which one to try and how to brew it. Contest success: a working, public, fullstack app that stands out on design.

## Positioning

Most café sites list a name and a price. Altura treats each coffee as a documented specimen: the story explains *why* the variables matter, and the menu shows those same variables per coffee, so the narrative and the data use one vocabulary.

## Capabilities and Constraints

- Scroll-driven story (planta → taza).
- Menu with full per-coffee sheets; filterable/comparable.
- "Encontrá tu café" quiz: short questions on taste and brew method → recommends a coffee from the menu plus grind and recipe. Served by an API route; no AI cost.
- "Barista IA": chat backed by the OpenAI API that answers only about the menu and brewing. Stretch goal after the quiz. API key lives in a Webflow Cloud secret env var (`OPENAI_API_KEY`), never in code. Needs per-user rate limiting and a spend cap set in the OpenAI dashboard.
- Runtime limits (Webflow Cloud): 10 MB worker bundle, 128 MB memory, 30 s CPU per request.
- No prices. No cart, no checkout, no accounts.
- Deadline: contest submission closes 2026-09-25 18:00 ART.

## Brand Commitments

- Name: **Altura** (fictional, chosen by Claude; the user delegated it).
- Language: Spanish only (neutral Spanish).

## Evidence on Hand

- No real roaster, farms, photos, or reviews. The menu is **fictional sample data**: origins, varietals and processes are real-world categories, but the specific lots, farms, producers and tasting notes are illustrative and must be labeled as such somewhere visible. Never present them as a real business.
- No photography supplied; imagery must be illustration/CSS/SVG or clearly licensed.

## Product Principles

1. Same vocabulary everywhere: every variable the story explains appears in the menu sheets.
2. Depth over decoration: the enthusiast wants data; show it precisely, don't dilute it.
3. The story must earn the scroll: each stage teaches one variable that changes the cup.
4. Honest about being fictional.
5. Ship working over ship complete: public URL first, polish after.

## Accessibility & Inclusion

Scroll animations must respect `prefers-reduced-motion` and the story must remain readable without animation. Keyboard-usable quiz and chat.
