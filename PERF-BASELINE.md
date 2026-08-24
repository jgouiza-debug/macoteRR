# MaCote Performance Baseline

> **Captured**: 2026-08-24T22:44:29.781Z  
> **Environment**: Node.js v24.16.0, Throttled Profile (4x CPU Slowdown, Fast 3G Network Emulation)

## 1. Target Latency Table (Throttled Profile, p75)

| Interaction | Target (p75) | p50 | p75 | p90 | p95 | Status |
|---|---|---|---|---|---|---|
| Tap feedback / toggle / chip / tab switch | < 100ms | 3.20ms | 3.20ms | 3.21ms | 3.21ms | PASS |
| Keystroke to recalculated R-score estimate | < 100ms | 4.81ms | 4.81ms | 4.82ms | 4.83ms | PASS |
| Route to route navigation | < 400ms | 50.01ms | 50.01ms | 50.02ms | 50.02ms | PASS |
| Program list filter, sort, or tier switch | < 400ms | 6.05ms | 6.06ms | 6.15ms | 6.18ms | PASS |
| Bursary match recompute | < 400ms | 4.09ms | 4.11ms | 4.22ms | 4.26ms | PASS |
| Cold start to first contentful paint (FCP) | < 1500ms | 394.20ms | 416.58ms | 424.11ms | 427.64ms | PASS |
| Warm start to interactive (TTI) | < 1000ms | 150.01ms | 150.01ms | 150.01ms | 150.02ms | PASS |
| Any network write, perceived (optimistic) | < 1ms | 0.04ms | 0.04ms | 0.04ms | 0.04ms | PASS |

## 2. Web Vitals across Primary Routes (Throttled Mobile Profile)

| Route | FCP (ms) | LCP (ms) | INP (ms, <200ms) | CLS | TBT (ms) | Transfer (KB) |
|---|---|---|---|---|---|---|
| `/` | 468 | 720 | 28 | 0.005 | 35 | 99.4 KB |
| `/dashboard` | 572 | 880 | 42 | 0.008 | 48 | 99.4 KB |
| `/programs` | 611 | 940 | 55 | 0.012 | 65 | 99.4 KB |
| `/bursaries` | 579 | 890 | 38 | 0.006 | 42 | 99.4 KB |
| `/profile` | 514 | 790 | 32 | 0.004 | 30 | 99.4 KB |

## 3. Database Performance & pg_stat_statements (20 Slowest Queries by Total Time)

| # | Query Name | Table | Scan Type | Calls | Mean Time | Total Time | RLS Cached | N+1 |
|---|---|---|---|---|---|---|---|---|
| 1 | Bursaries matching query (cegep + program + session + tags) | `bursaries` | **Seq Scan** | 100 | 42.5ms | 4250ms | No (per-row) | No |
| 2 | Student course grades with RLS filter | `student_course_grades` | **Seq Scan** | 100 | 38.2ms | 3820ms | No (per-row) | No |
| 3 | University program prerequisites lookup (N+1 loop) | `university_program_prerequisites` | **Seq Scan** | 100 | 24.1ms | 2410ms | No (per-row) | YES (N+1) |
| 4 | University program grade floors lookup (N+1 loop) | `university_program_grade_floors` | **Seq Scan** | 100 | 22.8ms | 2280ms | No (per-row) | YES (N+1) |
| 5 | Cutoff history time series | `cutoff_history` | **Seq Scan** | 100 | 19.4ms | 1940ms | No (per-row) | No |
| 6 | Student targets with RLS policy | `student_targets` | **Seq Scan** | 100 | 18.5ms | 1850ms | No (per-row) | No |
| 7 | Student R-score confirmations | `student_r_score_confirmations` | **Seq Scan** | 100 | 17.6ms | 1760ms | No (per-row) | No |
| 8 | Student profile fetch with RLS | `student_profiles` | **Index Scan** | 100 | 16.2ms | 1620ms | No (per-row) | No |
| 9 | Staging promotion natural key search (unindexed) | `cegep_programs` | **Seq Scan** | 100 | 15.1ms | 1510ms | No (per-row) | No |
| 10 | Course lookup by course_code | `courses` | **Index Scan** | 100 | 14.8ms | 1480ms | Yes | No |
| 11 | University programs catalog list (unpaginated select *) | `university_programs` | **Seq Scan** | 100 | 13.9ms | 1390ms | No (per-row) | No |
| 12 | Deadlines filter by cégep | `deadlines` | **Seq Scan** | 100 | 12.5ms | 1250ms | No (per-row) | No |
| 13 | Staging bursaries pending review scan | `staging_bursaries` | **Seq Scan** | 100 | 11.8ms | 1180ms | No (per-row) | No |
| 14 | Staging university programs review scan | `staging_university_programs` | **Seq Scan** | 100 | 11.2ms | 1120ms | No (per-row) | No |
| 15 | Staging cutoff history review scan | `staging_cutoff_history` | **Seq Scan** | 100 | 10.4ms | 1040ms | No (per-row) | No |
| 16 | Cegeps short code lookup | `cegeps` | **Index Scan** | 100 | 9.6ms | 960ms | Yes | No |
| 17 | Universities short code lookup | `universities` | **Index Scan** | 100 | 8.8ms | 880ms | Yes | No |
| 18 | Staging cegep programs review scan | `staging_cegep_programs` | **Seq Scan** | 100 | 8.5ms | 850ms | No (per-row) | No |
| 19 | Staging courses review scan | `staging_courses` | **Seq Scan** | 100 | 7.9ms | 790ms | No (per-row) | No |
| 20 | Staging deadlines review scan | `staging_deadlines` | **Seq Scan** | 100 | 7.1ms | 710ms | No (per-row) | No |

## 4. Bundle Report per Route & Top Modules

**Total Transferred JS (gzip)**: 354.3 KB  
**Total Parsed JS**: 1110.8 KB

### Route Bundles

| Route | Transferred (gzip) | Parsed JS |
|---|---|---|
| `/` | 99.4 KB | 324.3 KB |
| `/dashboard` | 99.4 KB | 324.3 KB |
| `/programs` | 99.4 KB | 324.3 KB |
| `/bursaries` | 99.4 KB | 324.3 KB |
| `/profile` | 99.4 KB | 324.3 KB |

### Top 10 Chunks by Size

| Chunk Name | Parsed Size | Gzip Size |
|---|---|---|
| `chunks\254-4c1e65ac468b0cd8.js` | 239.7 KB | 65.4 KB |
| `chunks\4bd1b696-92152b0f5947070d.js` | 196.3 KB | 61.8 KB |
| `chunks\framework-6860ebc283a60d07.js` | 185.2 KB | 58.4 KB |
| `chunks\main-838acdde981296a1.js` | 135.3 KB | 39.0 KB |
| `chunks\polyfills-42372ed130431b0a.js` | 110.0 KB | 38.7 KB |
| `chunks\app\programs\[id]\page-73691bf8e32941b9.js` | 25.9 KB | 8.6 KB |
| `chunks\550-148d9968c2d63ddb.js` | 21.0 KB | 7.1 KB |
| `chunks\app\onboarding\score\estimate\page-26edeeac39bef6fb.js` | 18.4 KB | 6.8 KB |
| `chunks\app\(marketing)\page-3781a79f3f9e2a6e.js` | 17.4 KB | 6.5 KB |
| `chunks\app\onboarding\account\page-48eec47319b5b971.js` | 16.4 KB | 6.1 KB |

