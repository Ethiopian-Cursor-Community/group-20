# Project brief & economic value (Ethiopia)

## What it is

**InfluencerHub** is a two-sided SaaS marketplace for Ethiopia: social media creators and brands/advertisers meet, run campaigns, message, and pay in ETB—replacing scattered DMs, informal deals, and unverifiable follower claims.

The product is a **Vite + React** web app backed by **Supabase** (auth, Postgres, RLS, realtime). **Cursor Agent SDK** (`@cursor/sdk`) is integrated for **developer automation only**—scripts that verify the API key and run one-shot local agents during build and hackathon workflows. It is **not** exposed in the browser and does not replace Supabase for end users.

## Problem

Ethiopia’s influencer economy is growing (Instagram, TikTok, YouTube, Telegram), but the market is fragmented:

- Brands struggle to find verified creators by niche and city
- Creators lack steady campaign flow and fair discovery
- Deals happen off-platform → no trust, no records, payment friction
- No local, ETB-native tooling aligned with mobile money habits

## Solution

| Capability | Implementation |
| --- | --- |
| Searchable creator directory | Public `/directory`, profile pages |
| Campaign posting + applications | Advertiser & influencer dashboards |
| Realtime messaging | Supabase realtime on `messages` |
| Tiered subscriptions (Free / Pro / Elite) | Plans + demo ETB checkout (RPC `demo_activate_plan`) |
| Admin moderation | Verification, platform health |
| **Dev automation (SDK)** | `npm run verify:sdk`, `npm run agent -- "…"` — local Cursor agents against this repo |

Payments use a **demo checkout** for hackathon demos (not live Chapa in the UI). Production can wire Chapa via Supabase edge functions when ready.

## Cursor SDK in this project

The SDK does **not** power the marketplace UI. It supports **how the team builds and validates** the app:

- **`CURSOR_API_KEY`** in `.env` (never `VITE_*`, never committed)
- **`npm run verify:sdk`** — confirms API key, lists models, runs a short local agent smoke test
- **`npm run agent -- "prompt"`** — one-shot local agent for tasks like refactors, summaries, or CI-style checks

This replaces the earlier standalone `hackathon-agent` package with a minimal, repo-native script layer on the official `@cursor/sdk`.

## Quality checks (latest)

| Check | Result |
| --- | --- |
| `npm run test` (TypeScript build + ESLint) | **Pass** — 0 errors, 3 non-blocking Fast Refresh warnings |
| `npm run verify:sdk` | **Pass** — models listed, local agent completed (`finished`) |
| Production bundle | Builds successfully (~1 MB JS; consider code-splitting later) |

Manual setup still required for full auth demos: disable **Confirm email** in Supabase Dashboard if you want instant sign-in without inbox verification.

## Economic value

| Stakeholder | Value |
| --- | --- |
| **Creators** | More paid work, professional profile, less reliance on random DMs |
| **SMEs & brands** | Lower cost to test influencer marketing; measurable campaigns in ETB |
| **Platform** | Subscription MRR + future take rate on campaigns |
| **Economy** | Formalizes a digital gig / creator channel—transparency, tax traceability potential, keeps spend on local payment rails |
| **Builders / operators** | SDK-backed automation lowers cost to ship fixes, migrations, and moderation tooling—faster iteration without extra headcount |

In a market with rising mobile internet and youth unemployment, marketplaces that match talent to demand in ETB support small-business growth and monetize creative work—aligned with Ethiopia’s push toward digital services and e-commerce. Agent SDK usage strengthens **delivery speed and reliability** of that marketplace, not the end-user transaction itself.

## One-line pitch

**“InfluencerHub is Ethiopia’s operating system for influencer marketing—discover verified creators, run campaigns, chat, and pay in birr.”**
