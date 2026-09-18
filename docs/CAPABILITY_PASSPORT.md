# AgentOS Capability Passport

The Capability Passport is the runtime record of what an AgentOS installation can actually use.

## Purpose

The passport separates **availability** from **advertised support**. A worker is useful to AgentOS only after its connection and capabilities have been verified by runtime discovery/health checks.

## Worker record

Each worker may contain:

- provider and worker identity;
- model/agent/specialist kind;
- verified status;
- actual capabilities;
- available connection modes (`free-limited`, `subscription`, `api`, `oauth`, `mcp`, `native`);
- subscription metadata;
- health/check timestamps;
- optional expiry for temporary subscriptions/trials;
- non-secret metadata.

Credentials are never stored in the passport.

## Free-first behaviour

The passport does not require a paid worker. Free/limited workers are valid capabilities when they are connected and healthy.

The Overseer should evaluate the passport before recommending any new purchase.

## Capability-gap detection

A requested task produces a set of required capabilities. The passport identifies capabilities that are not currently available from healthy/usable workers.

A gap is a technical fact. It is not a commercial recommendation.

## Temporary subscriptions

A worker may have `expiresAt`. When the expiry passes, the worker becomes `expired` and is no longer considered a healthy capability. AgentOS can then recalculate routing and determine whether renewal is actually beneficial.

## Recommendation pipeline

```text
Task requirements
      ↓
Capability Passport
      ↓
Available capability?
  ├── yes → route to existing worker
  └── no  → identify free alternatives
                ↓
             free option?
          ├── yes → use free option
          └── no  → identify paid/API options
                       ↓
                  estimate benefit
                       ↓
                recommend only if justified
```

## Commercial neutrality

Affiliate, referral, reward and partner metadata is deliberately absent from the technical `hasCapability` decision. Commercial acquisition is a separate downstream step after a technical need has been established.
