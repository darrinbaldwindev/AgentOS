# AgentOS Product and UX Research Report

## Executive recommendation

AgentOS should present autonomy as **a controllable service**, not as a technical setting. The mainstream mental model should be: “I choose what AgentOS is allowed to do, how often it checks, and whether it may use stronger AI when needed.” The interface should keep four concepts separate:

| User decision | Recommended plain-language label | What it controls | Default |
|---|---|---|---|
| Autonomy | **How much should AgentOS do on its own?** | Whether work is suggested, run after approval, or run automatically | **Check in before acting** |
| Timing | **When should AgentOS check?** | Optional 5-minute heartbeat and optional 30-minute autonomous team cycle | **Off** |
| Model policy | **Which AI should AgentOS use?** | Free-only, free-first/paid-when-required, or paid-preferred | **Free-first** |
| Cost protection | **What should happen near my limit?** | Notify, use a lighter model, pause, or stop | **Pause and ask** |

This separation is the central design decision. Users should not have to infer that a higher-priced plan changes autonomy, scheduling, or AgentOS functionality. The **$29/year and $99/year plans should expose the same controls and the same AgentOS capability set**. The only visible differences should be the models available, the amount of capacity, and the priority or concurrency available for heavier work.

The recommended default experience is a “safe automatic” posture: **AgentOS can prepare and monitor, but it asks before consequential actions; scheduled work is off until the user enables it; free-first routing is on; and any capacity boundary produces an explicit choice rather than a silent downgrade.** This follows a consistent pattern across current agent guidance: scope autonomy narrowly, test gradually, use least privilege, preserve human approval for critical actions, and keep auditable logs.[1] [2]

## Evidence base and design implications

Current products converge on a few strong patterns. OpenAI’s Operator documentation explicitly describes user takeover for credentials and payment details, confirmation before significant actions, close supervision on sensitive sites, and the ability to pause when suspicious behavior is detected.[1] Microsoft’s current autonomous-agent guidance similarly recommends narrow scope, gradual rollout, human oversight for critical actions, least-privileged access, fail-safes, and audit logging.[2] These are not merely enterprise controls: they provide the vocabulary for making consumer autonomy trustworthy.

Automation products make the execution lifecycle inspectable. Zapier’s history view separates runs from task usage, supports filtering by date, workflow, application, owner, and status, and allows unsuccessful runs to be replayed.[3] Cursor’s Plan Mode creates an editable plan before a complex agent task is executed, allowing users to review and modify the intended work before the agent changes the codebase.[4] The mainstream translation is to show users **what will happen next** before exposing how it is implemented.

Cost-management products distinguish monitoring from enforcement. Cloud platforms typically offer budgets and threshold alerts, while hard stopping requires additional enforcement logic; therefore AgentOS should make the difference explicit rather than hiding it behind a generic “budget” control.[5] Consumer AI products also demonstrate that model catalogs and raw identifiers are too technical for many users, while usage meters and reset explanations are understandable when expressed in task capacity and time remaining rather than tokens.

Progressive enhancement and progressive disclosure provide a useful design principle. GOV.UK recommends that the core service work with the simplest layer first and that richer interaction enhance, rather than replace, the basic service.[6] Microsoft Family Safety uses familiar objects, day-by-day schedules, reusable “Every day” actions, and a clear **Turn limits off** control rather than forcing users to understand a scheduling syntax.[7] Canva and Notion demonstrate two relevant commercial patterns: clearly distinguish what is included in the current plan, expose trial status and end dates, and keep existing content usable when a limit is reached rather than creating an abrupt lockout.[8] [9]

## Recommended product vocabulary

Avoid **heartbeat** and **autonomous team cycle** in the primary interface. They are useful internal or Tech Head terms but are not good default labels for mainstream users.

| Internal concept | Basic label | Essentials label | Tech Head label |
|---|---|---|---|
| 5-minute heartbeat | **Keep an eye on this** | **Background check** | **Heartbeat interval** |
| 30-minute autonomous team cycle | **Let the team work together** | **Team work cycle** | **Autonomous team cycle** |
| Free-only policy | **Use included AI only** | **Free models only** | **Free-only routing** |
| Free-first/paid-when-required | **Use included AI first** | **Use free first, upgrade only when needed** | **Free-first with paid escalation** |
| Paid-preferred policy | **Use the strongest available AI** | **Prefer higher-capability models** | **Paid-preferred routing** |
| Hard stop | **Pause when the allowance is used** | **Stop at my limit** | **Enforce hard capacity cap** |
| Alert-only | **Tell me when I’m getting close** | **Warn at a threshold** | **Alert-only budget policy** |
| Run history | **What happened** | **Activity history** | **Execution log** |
| Model | **AI choice** | **Model policy** | **Routing policy** |

Recommended global microcopy:

> **AgentOS works best when it starts small.** It will prepare work and show you what it plans to do. You can allow more independence at any time.

> **No surprise upgrades.** AgentOS will not switch to paid AI without following your model policy.

> **Same AgentOS in both paid plans.** The $99/year plan gives you more model choice and capacity—not a different version of AgentOS.

> **A stronger model is not always necessary.** AgentOS will use the least expensive option that can reasonably complete the task unless you choose otherwise.

## Three recommended default modes for each interface

The user asked for three default modes per view. These should be **behavior presets**, not separate product capabilities. Every view can access the same underlying AgentOS features; each view simply starts with a different level of visible detail and a different recommended default.

### Basic view

| Mode | Exact label | Supporting copy | Default behavior | Best for |
|---|---|---|---|---|
| 1 | **Guided** | “AgentOS prepares the next step and asks before it acts.” | No background schedules. Approval required for all external actions. Free-first policy. | New users and sensitive work |
| 2 | **Helpful** | “AgentOS can check in and handle routine work, while you stay in control.” | Optional 5-minute check available. Read-only and reversible actions can run automatically; consequential actions ask first. | Most mainstream users; recommended default after onboarding |
| 3 | **Independent** | “AgentOS keeps working between visits and only asks when your rules require it.” | Optional heartbeat and team cycle enabled after explicit confirmation. Cost protection pauses at limit. | Users who have completed a successful guided run |

Basic mode should never display raw model names, token counts, cron syntax, JSON, concurrency, or provider names. The primary status card should answer three questions: **What is AgentOS doing? When will it check again? What can it do without asking me?**

### Essentials view

| Mode | Exact label | Supporting copy | Default behavior | Best for |
|---|---|---|---|---|
| 1 | **Balanced** | “Use efficient AI for routine work and stronger AI only when the task needs it.” | Free-first/paid-when-required. Approval for writes, messages, purchases, and irreversible actions. | Recommended Essentials default |
| 2 | **Economical** | “Stay within included AI whenever possible. Pause rather than switch unexpectedly.” | Free-only or free-first with a hard pause. Optional usage threshold at 75%. | Budget-sensitive users |
| 3 | **High-capacity** | “Prefer stronger AI and keep more work moving at once.” | Paid-preferred. Higher-capacity models and concurrency when available. Still subject to user-defined limit and approvals. | Heavy users who value throughput |

Essentials may reveal capability categories—**Fast**, **Balanced**, and **Deep reasoning**—instead of technical model identifiers. It should include a compact **Capacity and cost** card showing current period usage, estimated remaining capacity, next reset, and the active policy.

### Tech Head view

| Mode | Exact label | Supporting copy | Default behavior | Best for |
|---|---|---|---|---|
| 1 | **Controlled** | “Require approval for every write, external call, and model escalation.” | Full audit trail, no silent fallback, hard cap enabled. | Production-like or sensitive environments |
| 2 | **Adaptive** | “Route routine work cheaply and escalate only when quality or context requires it.” | Configurable fallback chain, approval gates by action type, alerts and cap visible. | Recommended Tech Head default |
| 3 | **Throughput** | “Keep autonomous work moving with priority capacity and fewer interruptions.” | Paid-preferred, higher concurrency, configurable retry and escalation rules. | Advanced, non-sensitive workloads |

Tech Head can expose provider/model names, fallback chains, raw execution events, webhook details, concurrency, retry policy, and machine-readable exports. Even here, the human-readable summary must remain first: **“AgentOS paused because the selected budget cap was reached after 14 runs.”** The raw event should be an expansion, not the only explanation.

## Widget hierarchy

The home screen should be organized around **current state and next decision**, not around configuration categories.

| Priority | Widget | Basic | Essentials | Tech Head |
|---|---|---|---|---|
| 1 | **AgentOS status** | “Ready / Working / Waiting for you / Paused” | Same, plus active mode | Same, plus run ID and environment |
| 2 | **Next check** | “Background checks are off” or “Next check in 5 minutes” | Schedule summary and edit | Exact interval, trigger, timezone, jitter |
| 3 | **Needs your attention** | Approval cards only | Approvals plus warnings and retries | Approval queue, policy violations, failed gates |
| 4 | **Today’s work** | Plain-language activity cards | Step timeline and usage | Full execution timeline and traces |
| 5 | **AI choice** | “Included AI first” | Policy selector and capacity summary | Routing chain and model controls |
| 6 | **Protection** | “Pause at my limit” | Thresholds, fallback, pause | Hard cap, alerts, concurrency, quotas |
| 7 | **Advanced details** | Hidden | Collapsed | Expanded by default |

The persistent top-level control should be **Pause all background work**. It should be available from every view. A paused state must show why it is paused, what remains queued, and the single action needed to resume.

## Autonomy and scheduling design

Autonomy should be expressed as a ladder of authority rather than a single on/off switch. The recommended ladder is:

1. **Suggest** — AgentOS prepares a plan and waits.
2. **Prepare** — AgentOS gathers information and drafts reversible work.
3. **Routine** — AgentOS may perform explicitly allowed, reversible tasks.
4. **Act with approval** — AgentOS pauses before external communication, data changes, purchases, publishing, deletion, or other consequential actions.
5. **Independent** — AgentOS acts within a narrow scope and reports afterward.

Use the following control card:

> **How much should AgentOS do on its own?**
>
> **Guided** — Ask before every action.
>
> **Helpful** — Handle routine, reversible work; ask before important actions.
>
> **Independent** — Keep working within your rules; pause when a rule or limit is reached.
>
> **View or change rules**

The 5-minute heartbeat should be opt-in and framed as responsiveness, not as a mysterious technical process:

> **Keep an eye on this**
>
> AgentOS checks for relevant changes every 5 minutes while this task is active. It does not take important actions without your approval.
>
> **Turn on background checks**
>
> **What it uses:** one background check each interval while active. You can pause it at any time.

The 30-minute cycle should also be opt-in and require a scope preview:

> **Let the team work together**
>
> Every 30 minutes, AgentOS lets the assigned agents review progress, divide the next steps, and move routine work forward. It will stop for your approval when an action affects other people, changes important data, or reaches your limit.
>
> **Review what the team may do**
>
> **Turn on team work**

Do not enable both intervals silently. If both are selected, explain the relationship:

> **These settings work together.** Background checks notice changes every 5 minutes. Team work cycles coordinate progress every 30 minutes. You can use either one, both, or neither.

The schedule editor should use a day/time or interval picker, timezone confirmation, active-hours window, **Run once now**, **Pause**, and **Turn off**. Avoid cron expressions except in Tech Head.

## Model-policy design

Model policy must not be nested inside the autonomy control. It answers **which AI may be used**, not **what AgentOS may do**.

Use a three-choice radio group with a visible effect preview:

| Exact label | Exact supporting copy | Behavior |
|---|---|---|
| **Use included AI only** | “Never use paid AI. Pause and ask if included AI cannot complete the task.” | Free-only |
| **Use included AI first** | “Try included AI first. Use paid AI only when it is needed and allowed by your limit.” | Free-first/paid-when-required |
| **Use the strongest available AI** | “Prefer higher-capability AI for difficult work. This can use more of your plan’s capacity.” | Paid-preferred |

For Basic, show only these three policy labels. For Essentials, add a short example: **“A simple summary may use included AI; a complex multi-step plan may use a stronger model.”** For Tech Head, expose the underlying routing chain.

Never silently downgrade. If fallback is enabled, show a compact event message:

> **AgentOS used Balanced AI instead of Deep reasoning because the preferred model was at capacity.**
>
> **Change fallback settings**

If a paid model would be used under a free-first policy, show a preflight card when the cost or capacity consequence is material:

> **This task needs stronger AI to continue.** Your policy allows AgentOS to use paid-plan capacity. Estimated use: **1 higher-capability run**. **Continue once** / **Always allow for this task** / **Pause instead**.

## Cost-control design

Use a two-axis protection model: **notification** and **enforcement**. Do not combine them into one ambiguous budget slider.

| Control | Exact label | Basic default | Essentials default | Tech Head option |
|---|---|---|---|---|
| Status | **Capacity used this period** | Simple bar and reset date | Bar plus task breakdown | Tokens, runs, concurrency, and provider detail |
| Warning | **Tell me when I’m getting close** | On at 80% | On at 75% | Custom thresholds |
| Fallback | **Use lighter AI if available** | On | Selectable | Ordered fallback chain |
| Enforcement | **Pause when my limit is reached** | On | On | Hard cap, per-task/project cap |
| Emergency control | **Pause all background work** | Always visible | Always visible | Always visible and API-accessible |

Recommended Basic microcopy:

> **You’re using 62% of this period’s AI capacity.** AgentOS will pause before exceeding your protection limit. Resets in 12 days.

Recommended Essentials microcopy:

> **At 75%, I’ll warn you. At 100%, I’ll pause background work.** You can change this in Protection.

Recommended Tech Head microcopy:

> **Enforcement: hard cap.** Stop new runs at 100% of monthly capacity; allow the active step to finish; queue remaining work.

The product should not promise an exact dollar cost unless it can calculate it reliably. For annual plans, use **capacity**, **higher-capability runs**, **background concurrency**, and **reset date** as the primary concepts. If a monetary estimate is available, label it as an estimate and show its assumptions.

## Onboarding flow

The first-run flow should complete in under five minutes and teach one decision at a time.

| Step | Screen heading | Required action | Recommended default |
|---|---|---|---|
| 1 | **What would you like AgentOS to help with?** | Choose one starter goal | A concrete starter template |
| 2 | **How involved should AgentOS be?** | Choose Guided, Helpful, or Independent | Helpful, but only after explaining it |
| 3 | **When may it work in the background?** | Choose Off, Keep an eye on this, or Let the team work together | Off |
| 4 | **Which AI should it use?** | Choose one of the three model policies | Use included AI first |
| 5 | **What should happen at your limit?** | Choose pause, lighter AI, or notify | Pause and ask |
| 6 | **Review your first task** | Show scope, allowed actions, next check, and policy | Confirm |
| 7 | **Run a safe example** | Execute a reversible task | Guided success |

The review screen should say:

> **Your AgentOS setup**
>
> It will help with: **weekly project updates**.
>
> It may do automatically: **collect information and prepare a draft**.
>
> It must ask first before: **sending messages, changing shared data, or deleting anything**.
>
> Background work: **off**.
>
> AI policy: **included AI first; pause before using stronger AI**.
>
> Protection: **warn at 75%; pause at the limit**.

Only after the user completes one safe run should AgentOS recommend enabling the 5-minute or 30-minute option. This follows the evidence-based pattern of simulation, gradual rollout, and incremental expansion of responsibility.[2]

## 30-day free taste and upgrade journey

The free experience should demonstrate the whole AgentOS product, not a crippled workflow builder. Hold back **capacity and model breadth**, not the core controls. This is important because users need to experience autonomy, scheduling, approvals, activity history, pause/resume, and protection before they can understand the product’s value.

| Period | User experience | Product message | Upgrade posture |
|---|---|---|---|
| Days 1–3 | Guided starter task; all core views available; schedules off | **See how AgentOS works safely.** | No paywall during the first successful task |
| Days 4–7 | Offer one supervised 5-minute check or one 30-minute team cycle | **Try background work with clear limits.** | Explain capacity, not features withheld |
| Days 8–14 | Show history, policy changes, and one model-policy experiment | **Choose how much independence fits you.** | Introduce $29/year as the everyday capacity plan |
| Days 15–21 | Personalized usage summary | **Your setup is ready to keep.** | Explain whether the user needs more capacity or not |
| Days 22–27 | Show upcoming end date and preserve all data/settings | **Your AgentOS setup remains yours.** | Present side-by-side plan comparison with feature parity |
| Days 28–30 | Final reminder with exact date and consequence | **Your Free Taste ends on [date].** | Let the user choose $29/year, $99/year, or export/pause |
| After day 30 | Readable, reversible downgrade state | **Your work is safe. Background work is paused until you choose a plan.** | Never delete tasks, history, or settings immediately |

Recommended free limits are **small, explicit, and reversible**: a capped number of background checks, a limited number of team cycles, included AI capacity, and no silent paid escalation. Do not hide the 5-minute heartbeat or 30-minute cycle entirely; let users try them under a visible allowance. Do not put basic approvals, pause controls, history, or model policy behind a paywall.

## Plan positioning without implying “better AgentOS”

Use plan names that describe **capacity**, not product quality. For example:

| Plan | Headline | Supporting copy | What changes |
|---|---|---|---|
| Free Taste | **Try the complete AgentOS experience for 30 days** | “Includes the core workspace, views, autonomy controls, schedules, approvals, and history with limited AI capacity.” | Time-limited capacity and model access |
| $29/year | **AgentOS Everyday** | “The complete AgentOS with dependable included AI capacity for regular personal work.” | Standard model availability and capacity |
| $99/year | **AgentOS High Capacity** | “The same complete AgentOS with more model choice and capacity for heavier workloads.” | More capable models, higher capacity, priority/concurrency where applicable |

The comparison table should have a first row reading **“AgentOS features” — Same on both plans**. Then list **Model availability**, **Capacity**, **Concurrent background work**, and **Priority during busy periods**. Avoid columns labelled **Basic**, **Pro**, or **Advanced features** if those imply that the $99 plan contains a superior product. Avoid badges such as **Best**, **Premium experience**, or **Unlock everything**.

The $99 upgrade should be triggered by demonstrated need, not anxiety. Example:

> **You’re ready for more capacity, not a different AgentOS.** Your current setup and controls stay the same. High Capacity adds more model choice and lets more background work run at once.
>
> **Keep Everyday** / **Choose High Capacity**

## Features to expose versus hold back

| Expose in Free Taste | Hold back or limit by capacity |
|---|---|
| All three views, with progressive detail | Frontier model breadth and highest-capability routing |
| Guided, Helpful, and Independent modes | Number of concurrent background runs |
| 5-minute heartbeat trial with clear allowance | Volume of heartbeat checks |
| 30-minute autonomous team cycle trial with clear allowance | Volume of team cycles |
| All three model policies | Paid capacity under the user’s explicit policy |
| Approval gates, pause, resume, and emergency stop | Priority queue during high demand |
| Activity history and plain-language failure explanations | Long retention or high-volume raw telemetry if storage is costly |
| Task templates and safe examples | Very large context windows or heavy multi-agent workloads |
| Export of user-created tasks and settings | None of the user’s core configuration or data |

The rule is: **do not withhold the mental model; limit the resource.** Users should learn how AgentOS behaves before paying, while paid plans should remove waiting, capacity, and model-choice constraints.

## Usability and trust risks

**Confirmation fatigue.** If AgentOS asks for approval for every minor action, users will approve mechanically. Group routine actions, show the exact scope, and let users create narrow reusable rules such as **“Allow reading project files; ask before changing them.”**

**Silent model degradation.** Automatic fallback can change quality without the user realizing it. Every fallback should be visible in the activity stream, and Essentials/Tech Head should offer **Pause instead**.

**Runaway loops.** Two background intervals can multiply activity. Display next-run time, recent run count, estimated capacity impact, and a one-click global pause. The 30-minute team cycle should have an explicit maximum active duration or a clear stop condition.

**Terminology leakage.** “Heartbeat,” “tokens,” “orchestration,” “concurrency,” and “cron” will make the Basic view feel like developer software. Keep those terms in Tech Head and documentation.

**False equivalence between approval and safety.** An approval button alone does not make an action safe. Show the target, scope, affected items, and irreversible consequences in the approval card. OpenAI’s Operator model is useful here: takeover for credentials, approval before significant actions, and close supervision in sensitive contexts.[1]

**Trial anxiety and surprise billing.** Show the end date in the account area, on the plan page, and in the final reminder. Explain whether payment details are required and what happens after the taste ends. Canva’s current help content is a useful pattern: it exposes the trial end date, provides a reminder, and explains that a trial can end automatically when no payment details were provided.[8]

**Overly technical upgrade prompts.** Do not say “You need a larger context window” or “Your provider rate limit was exceeded” in Basic. Say **“This task needs more AI capacity than your current plan has available.”** Put the technical explanation behind **Why did this pause?**

**Loss of trust from locked data.** After day 30, pause background work and preserve tasks, history, and settings in a readable state. Notion’s current plan behavior—existing content remains readable and editable even when a free limit is reached—is a useful precedent for graceful degradation.[9]

## Success measures

The design should be evaluated with task-based usability research and product telemetry. The primary measures should be whether users can predict what AgentOS will do, understand why it paused, select an appropriate model policy without knowing model names, and recover from a failed or paused task.

| Measure | Target direction |
|---|---|
| Users who can correctly explain what the 5-minute setting does | Increase |
| Users who can distinguish autonomy from model policy | Increase |
| Users who notice an automatic fallback | Increase |
| Unintended approvals per active user | Decrease |
| Background tasks paused by users before harm or confusion | Increase initially, then stabilize |
| Support contacts about surprise usage or surprise billing | Decrease |
| Free users who complete a safe autonomous cycle | Increase |
| Upgrades attributed to capacity need rather than feature fear | Increase |
| Users who believe $99 has a different AgentOS feature set | Approach zero |

## References

[1]: https://openai.com/index/introducing-operator/ “Introducing Operator,” OpenAI, 23 January 2025; current page notes its integration into ChatGPT agent mode and describes takeover, approvals, watch mode, and task limitations.

[2]: https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/autonomous-agents “Design autonomous agent capabilities,” Microsoft Learn, updated 11 June 2026.

[3]: https://help.zapier.com/hc/en-us/articles/8496291148685-View-and-manage-your-Zap-history “View and manage your Zap history,” Zapier Help, updated 2026.

[4]: https://cursor.com/blog/plan-mode “Introducing Plan Mode,” Cursor, 7 October 2025.

[5]: https://aws.amazon.com/blogs/machine-learning/track-allocate-and-manage-your-generative-ai-cost-and-usage-with-amazon-bedrock/ “Track, allocate, and manage your generative AI cost and usage with Amazon Bedrock and AWS Budgets,” AWS Machine Learning Blog, 2026.

[6]: https://www.gov.uk/service-manual/technology/using-progressive-enhancement “Building a robust frontend using progressive enhancement,” GOV.UK Service Manual, updated 27 September 2024.

[7]: https://support.microsoft.com/en-us/family-safety/set-screen-time-limits-across-devices “Set screen time limits across devices,” Microsoft Support, current help documentation accessed 12 September 2026.

[8]: https://www.canva.com/help/upgrade-to-canva-pro-or-business/ “Upgrading to Canva Pro or Canva Business,” Canva Help, current help documentation accessed 12 September 2026.

[9]: https://www.notion.com/pricing “Notion Pricing Plans,” Notion, current pricing page accessed 12 September 2026.

[10]: https://openrouter.ai/docs/guides/routing/model-fallbacks “Model Fallbacks,” OpenRouter Documentation, current documentation accessed 12 September 2026.

[11]: https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform “Managing projects in the API platform and troubleshooting API usage and spend limits,” OpenAI Help Center, current documentation accessed 12 September 2026.

[12]: https://learn.microsoft.com/en-us/azure/foundry/concepts/manage-costs “Plan and manage costs,” Microsoft Azure Documentation, current documentation accessed 12 September 2026.

*Prepared by Manus AI. Recommendations are product and UX strategy, not implementation instructions; observed product behavior is distinguished from AgentOS-specific inference throughout.*
