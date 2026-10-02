# Documentation

When documents conflict, priority follows `CLAUDE.md`:
CLAUDE.md → ARCHITECTURE → DATABASE → DESIGN → ROADMAP.

| Document | What it covers |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Platform architecture, data flow, theme engine, security model |
| [DATABASE.md](DATABASE.md) | Schema, RLS rules, storage layout |
| [DESIGN.md](DESIGN.md) | Visual direction for Nusantara Ivory and admin design rules |
| [ROADMAP.md](ROADMAP.md) | Phases and scope boundaries |
| [SKILL.md](SKILL.md) | Expected engineering and design judgment for agents |
| [PROJECT_MEMORY.md](PROJECT_MEMORY.md) | Durable cross-session state: decisions, rollouts, gotchas |

## Folders

- `briefs/` — one-off task briefs given to agents, kept for traceability.
- `superpowers/specs/` and `superpowers/plans/` — design specs and
  implementation plans per feature, dated.
- `visual-review/` — visual QA reports. Screenshots are git-ignored and
  stay on the machine that produced them; the reports and JSON results are
  tracked.
