# AgentOS — Complete Handover Document

**Version:** 1.0  
**Date:** 2026-08-21  
**Prepared by:** architect-prime (Primary Coordinator)  
**For:** Next AI Instance / New Team Member  

---

## 🎯 Introduction

**Welcome to AgentOS.** You are inheriting a **local-first, multi-model AI Agent Operating System** with built-in referral monetization. Think of it as: *"VS Code for AI Agents" meets "Smart Router + Affiliate Engine."*

### The Vibe
- **Local-First, Privacy-by-Default:** User data never leaves their machine unless they explicitly choose cloud.
- **Developer Experience Obsessed:** Keyboard-first, type-safe, streaming, extensible.
- **Business Model Built-In:** Referral routing pays for the app. Users save money; you earn sustainably.
- **Standards-Native:** MCP for tools, SQLite for state, Git for sync, age for encryption.
- **Agent-Native:** Not a chat wrapper — an agent runtime with planning, memory, swarms, and sandbox execution.

---

## 🧠 Continuity System (How We Remember)

We **do not rely on chat history.** We use a **file-based canonical record** in `agents/continuity_log/`.

### The Protocol (AI Coordination Kit v1.0)
| Role | Assignment |
|------|------------|
| **Project Owner** | Human (you) |
| **Primary Coordinator** | architect-prime (this AI role) |
| **Canonical Record** | `agents/continuity_log/` (SESSION_XXX.md files) |
| **Specialist Agents** | Spawned per-task (e.g., `research-analyst-01`) |

### How Handoffs Work
1. Coordinator writes task brief → `agents/tasks/TASK_XXX.md`
2. Specialist runs in **separate chat/sandbox** → outputs `<<<REPORT_BLOCK>>>`
3. Human copies report block → pastes to Coordinator
4. Coordinator reviews → writes manifest → updates ledger → records disposition

**No shared memory between chats.** The filesystem + clipboard is the message bus.

---

## 📁 Complete File Inventory

```
E:\Downloads\Perplexity\PRS\AgentOS\
├── agents/
│   ├── PROJECT_COORDINATION_CHARTER.md      # Constitution: roles, authority, boundaries
│   ├── COORDINATION_LEDGER.md               # Append-only task/result/disposition log
│   ├── COORDINATION_EVALUATION_TEMPLATE.md  # Post-pilot evaluation rubric
│   ├── charters/
│   │   └── AFFILIATE_RESEARCHER_CHARTER.md  # Durable role definition
│   ├── continuity_log/
│   │   ├── INDEX.md                         # Navigation + decision registry
│   │   ├── SESSION_001_FOUNDATION.md        # Vision, architecture, stack, monetization
│   │   ├── SESSION_002_SCHEMA_DESIGN.md     # SQLite DDL, Rust/TS types, migrations
│   │   ├── SESSION_003_CONTEXT_ASSEMBLY.md  # Context pipeline, tokenizer, RAG, budget bar
│   │   ├── SESSION_004_PROVIDER_ABSTRACTION.md # Provider trait, implementations, registry
│   │   ├── SESSION_005_ROUTING_ENGINE.md    # Heuristic router, scoring, referral bonus
│   │   ├── SESSION_006_IPC_CONTRACT.md      # Tauri commands, specta/ts-bindgen types
│   │   ├── SESSION_007_LOCAL_LLM_OPS.md     # Ollama, hardware profiling, quantization
│   │   ├── SESSION_008_MCP_SANDBOX.md       # MCP-first tools, native sandbox, GitHub/Perplexity
│   │   ├── SESSION_009_COORDINATION_ADOPTION.md # Kit adoption, charter, ledger, pilot
│   │   ├── SESSION_010_MCP_CORE_REGISTRY.md # MCP transport, toolset, registry manager
│   │   ├── SESSION_011_SANDBOX_ENGINE.md    # bwrap/firejail, languages, git, snapshots
│   │   ├── SESSION_012_GITHUB_PERPLEXITY_MCP.md # GitHub OAuth, Perplexity MCP, OpenHands
│   │   ├── SESSION_013_AGENT_LOOP.md        # Planner/Executor/Verifier, streaming events
│   │   ├── SESSION_014_LICENSING_ENTITLEMENTS.md # Free/Pro gates, trial, referral rewards
│   │   ├── SESSION_015_USAGE_DASHBOARD.md   # Context budget, referral earnings, savings
│   │   ├── SESSION_016_GITHUB_SYNC.md       # Encrypted Git sync, AI read access via API
│   │   ├── SESSION_017_PROMPT_LAB.md        # Versioned prompts, variables, testing, A/B
│   │   ├── SESSION_018_BROWSER_EXTENSION.md # MV3 extension, native messaging, context capture
│   │   ├── SESSION_019_VOICE_INTERFACE.md   # whisper.cpp + piper + porcupine, local STT/TTS
│   │   ├── SESSION_020_TIME_TRAVEL_DEBUG.md # Sandbox snapshots, rewind, fork, diff
│   │   ├── SESSION_021_BENCHMARK_DASHBOARD.md # Personal leaderboard, auto-router integration
│   │   ├── SESSION_022_CONTEXT_HEALTH.md    # Hallucination risk detection, auto-mitigation
│   │   ├── SESSION_023_TEMPLATE_MARKETPLACE.md # .agentpkg format, registry, CLI
│   │   ├── SESSION_024_PRIVACY_SHIELD.md    # Auto-redaction, local-only mode
│   │   ├── SESSION_025_COST_OPTIMIZER.md    # One-click savings, referral routing
│   │   ├── SESSION_026_REFERRAL_ATTRIBUTION.md # Per-provider/user attribution
│   │   ├── SESSION_027_AOP_SPEC.md          # AgentOS Protocol (open workspace format)
│   │   ├── SESSION_028_SWARM_ORCHESTRATION.md # Hierarchical/peer/pipeline/debate swarms
│   │   ├── SESSION_029_GRAPH_PLANNING.md    # DAG-based planning, parallel execution, replanning
│   │   ├── SESSION_030_SDK.md               # TypeScript/Python/Rust SDKs
│   │   ├── SESSION_031_TESTING_QA.md        # Test pyramid, agent harness, golden masters, CI
│   │   ├── SESSION_032_DOCS_ONBOARDING.md   # Interactive tutorials, auto-generated docs
│   │   ├── SESSION_033_PERFORMANCE.md       # Startup, streaming, DB, bundle optimization
│   │   ├── SESSION_034_ACCESSIBILITY_I18N.md # a11y checklist, svelte-i18n
│   │   ├── SESSION_035_RELEASE_DISTRIBUTION.md # Tauri build, auto-updater, channels
│   │   ├── SESSION_036_TELEMETRY.md         # Opt-in, anonymized, batched
│   │   ├── SESSION_037_CONTRIBUTING_GOVERNANCE.md # CONTRIBUTING.md, release process
│   │   ├── SESSION_038_SECURITY_COMPLIANCE.md # Secrets, audit log, SOC2/HIPAA/GDPR
│   │   ├── SESSION_039_ADVANCED_RAG.md      # Graph RAG, hybrid search, multi-modal
│   │   ├── SESSION_040_AGENT_MEMORY.md      # Episodic/Semantic/Procedural + consolidation
│   │   ├── SESSION_041_MODEL_HOSTING.md     # vLLM, TGI, Ollama, LM Studio abstraction
│   │   ├── SESSION_042_FEDERATION.md        # Federated router, MPC + DP analytics
│   │   ├── SESSION_043_RECOVERY.md          # Encrypted backup, offline-first queue
│   │   ├── SESSION_044_ADVANCED_ROUTING.md  # Bandit, RL, LLM Judge, hybrid strategies
│   │   ├── SESSION_045_PLUGIN_SYSTEM.md     # Frontend plugin architecture (WASM sandbox)
│   │   ├── SESSION_046_ENTERPRISE.md        # SSO, RBAC, DLP, compliance
│   │   ├── SESSION_047_DISTRIBUTION.md      # White-label builder, OEM distributions
│   │   ├── SESSION_048_FUTURE_PROOFING.md   # Capability negotiation, versioned IPC
│   │   └── SESSION_CHECKLIST.md             # Checklist for saving chat history
│   ├── prompts/
│   │   └── RESEARCHER_ONBOARDING_COPY_BLOCK.md # Paste to spawn research-analyst-01
│   ├── research/
│   │   └── affiliate/
│   │       ├── REGISTRY_MANIFEST.json       # Verified affiliate programs (5 providers)
│   │       └── BRIEF_2026-08-21.md          # Research summary + decisions
│   ├── reviews/                             # Empty (for future review dispositions)
│   └── tasks/
       ├── TASK_001_AFFILIATE_VERIFY.md      # Completed (Tier-1 verification)
       ├── TASK_002_AFFILIATE_TIER2_VERIFY.md # Requested (10 providers)
       ├── TASK_003_MCP_VERIFICATION.md      # Requested (Groq/Together/Perplexity MCP)
       └── TASK_004_TOGETHER_AI_CONFIRMATION.md # Requested (official confirmation)
```

---

## 🏗️ Architecture Summary (The "Mental Model")

```
┌─────────────────────────────────────────────────────────────────┐
│                        AGENTOS                                    │
├─────────────────────────────────────────────────────────────────┤
│  FRONTEND (Svelte 5)          BACKEND (Rust Sidecar)            │
│  ├ Chat UI                    ├ Router Engine                    │
│  ├ Dashboard                  ├ Context Assembler                │
│  ├ Prompt Lab                 ├ Provider Registry                │
│  ├ Templates                  ├ Agent Runtime (Planner/Executor) │
│  ├ Voice UI                   ├ MCP Client + Registry            │
│  ├ Settings                   ├ Sandbox Manager (bwrap)          │
│  └ a11y/i18n                  ├ GitHub Sync (encrypted)          │
│                               ├ License/Entitlements             │
│                               ├ Referral Tracker                 │
│                               └ Core Services (SQLite+LanceDB)   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         EXTERNAL APIs    LOCAL TOOLS      SYNC
         ├ OpenAI         ├ Ollama          ├ GitHub (encrypted)
         ├ Anthropic      ├ LM Studio       ├ Git (versioned)
         ├ Groq           ├ vLLM/TGI        └ age encryption
         ├ OpenRouter
         ├ Perplexity
         └ GitHub MCP
```

---

## 🎯 Strategic Decisions (Forks Resolved)

| Fork | Decision | Rationale |
|------|----------|-----------|
| **Frontend** | **Svelte 5** | Tiny bundles, compiled reactivity, `shadcn-svelte` exists |
| **Referral Ethics** | **Opt-In Per Provider** | Legal safety, user trust, granular control |
| **Sync** | **Pure Local v1** (GitHub Sync later) | Scope control; escape hatch = user puts SQLite in iCloud/Syncthing |
| **Tools** | **MCP-First (No WASM)** | Real binaries, git, playwright, pip/cargo — no Pyodide limits |
| **Monetization** | **Referral Router (Opt-In)** | Router prefers your ref links when user enables; transparent UI |

---

## 🔑 Key Technical Decisions

| Area | Decision |
|------|----------|
| **Framework** | Tauri v2 (Rust + Svelte 5) |
| **Database** | SQLite (WAL) + LanceDB (vectors) |
| **Auth** | OS Keychain (no plaintext secrets in DB) |
| **Tools** | MCP stdio/SSE (GitHub official, Perplexity community, filesystem, sqlite, python) |
| **Sandbox** | bwrap (Linux), firejail (macOS), Job Objects (Windows) |
| **Sync** | Git + age encryption (per-workspace repo) |
| **Streaming** | Tauri `Channel` (SSE-like) |
| **Types** | `specta` + `ts-bindgen` (Rust ↔ TS zero-boilerplate) |
| **Testing** | `cargo test` + `vitest` + `playwright` + golden masters |
| **CI/CD** | GitHub Actions → Tauri bundle → signed artifacts → updater |

---

## 💰 Referral Program Status (Verified)

| Provider | Program | Type | Status | Router Inclusion |
|----------|---------|------|--------|------------------|
| **Perplexity** | $10/mo credit (Pro referrer) | Credit-share | ✅ Verified | **YES** (opt-in) |
| **OpenRouter** | Discontinued (May 2025) | — | ❌ None | NO |
| **Groq** | No public program | — | ❌ None | NO |
| **GitHub** | B2B Partner only | — | ❌ None | NO (OAuth App task) |
| **Together AI** | 3rd-party claims only | Cash (claimed) | ⚠️ Experimental | NO |

**Registry:** `agents/research/affiliate/REGISTRY_MANIFEST.json` (v1)

---

## 🚀 Implementation Roadmap (Phased)

### Phase 1: MVP (Weeks 1-4)
| Week | Sessions | Deliverable |
|------|----------|-------------|
| 1 | 001, 002, 006 | Tauri + SQLite + IPC + OpenAI/Anthropic/Ollama |
| 2 | 003, 004, 005 | Context Assembly + Provider Registry + Heuristic Router |
| 3 | 007, 008, 010 | Ollama Manager + MCP Client + Registry (5 builtin) |
| 4 | 011, 012 | Sandbox (bwrap + Python/Node) + GitHub MCP + OAuth |

### Phase 2: Core Value (Weeks 5-8)
| Week | Sessions | Deliverable |
|------|----------|-------------|
| 5 | 013, 014, 015 | Agent Loop + Licensing + Usage Dashboard |
| 6 | 016, 017 | GitHub Sync + Prompt Lab |
| 7 | 018, 019, 020 | Browser Extension + Voice + Time Travel |
| 8 | 021, 022, 025 | Benchmarks + Context Health + Cost Optimizer |

### Phase 3: Differentiation (Weeks 9-12)
| Week | Sessions | Deliverable |
|------|----------|-------------|
| 9 | 023, 024, 026 | Template Marketplace + Privacy Shield + Referral Attribution |
| 10 | 027, 028, 029 | AOP Spec + Swarm + Graph Planning |
| 11 | 030, 031, 032 | SDKs + Testing + Docs/Tutorials |
| 12 | 033, 034, 035 | Performance + a11y/i18n + Release Pipeline |

### Phase 4: Enterprise & Platform (Weeks 13-16)
| Week | Sessions | Deliverable |
|------|----------|-------------|
| 13 | 036, 037, 038 | Telemetry + Governance + Security/Compliance |
| 14 | 039, 040, 041 | Advanced RAG + Memory + Model Hosting |
| 15 | 042, 043, 044 | Federation + Recovery + Advanced Routing |
| 16 | 045, 046, 047, 048 | Plugins + Enterprise + Distribution + Future-Proofing |

---

## 🎭 How to Resume Work

### If You're the Coordinator (architect-prime)
1. **Read `INDEX.md`** for navigation
2. **Check `COORDINATION_LEDGER.md`** for active threads
3. **Review latest `SESSION_XXX.md`** for context
4. **Issue next task** via `agents/tasks/TASK_XXX.md`
5. **Spawn specialist** by pasting `RESEARCHER_ONBOARDING_COPY_BLOCK.md` to new chat

### If You're a Specialist (e.g., research-analyst-01)
1. **Paste `RESEARCHER_ONBOARDING_COPY_BLOCK.md`** to new chat
2. **Read all referenced files** from `agents/`
3. **Execute task** per brief
4. **Output `<<<REPORT_BLOCK>>>`** for Coordinator

### If You're the Human (Owner)
- **Approve strategic forks** (already done for v1)
- **Review dispositions** in ledger
- **Manage API keys** in OS Keychain
- **Run `pnpm tauri dev`** to test

---

## ⚠️ Known Blockers / Open Items

| Item | Status | Owner |
|------|--------|-------|
| **Session 001-008 chat history** | Need saved to `continuity_log/` | Human (copy from chat) |
| **Tier-2 affiliate verification** | TASK_002 requested | affiliate-researcher-01 |
| **MCP verification (Groq/Together/Perplexity)** | TASK_003 requested | affiliate-researcher-01 |
| **Together AI official confirmation** | TASK_004 requested | research-analyst-01 |
| **GitHub OAuth App creation** | Separate task needed | Owner/Coordinator |
| **Cursor affiliate verification** | Check cursor.com/referral | Researcher |
| **Replicate/Mistral program verification** | Check official sites | Researcher |

---

## 📝 For the Next AI Instance: Your First Actions

1. **Read `agents/continuity_log/INDEX.md`** — this is your map
2. **Read `agents/PROJECT_COORDINATION_CHARTER.md`** — your constitution
3. **Read `agents/COORDINATION_LEDGER.md`** — current state
4. **Read `agents/continuity_log/SESSION_048_FUTURE_PROOFING.md`** — latest spec
5. **Decide next task** — check ledger for `REQUEST` entries
6. **Announce yourself** — "architect-prime online. Continuity restored."

---

## 🏁 Final Note

This project is **spec-complete through Session 048** (~22,000 lines of spec). The architecture is coherent, the decisions are recorded, the governance is active, and the first specialist pilot is mid-flight.

**You have everything needed to start building.** The specs are implementation-ready. The continuity system works. The referral engine has its first verified provider (Perplexity).

**Welcome to AgentOS. Let's build the OS for AI agents.**

---

*End of Handover*  
*architect-prime signing off*  
*2026-08-21*