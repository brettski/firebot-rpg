# Job loot pays for risk

**Date:** 2026-09-18
**Status:** Active
**Related:** #28

## Decision

Every job's `loot.item.rarity` array is now drawn from one canonical table, keyed by
`(challenge tier, encounter present or not)`:

| tier | safe | E(safe) | fight | E(fight) | margin |
|---|---|---|---|---|---|
| easy | `['basic']` | 1.000 | `['basic','rare']` | 1.412 | +0.412 |
| medium | `['basic','rare']` | 1.412 | `['rare','epic']` | 2.222 | +0.810 |
| hard | `['rare']` | 2.000 | `['rare','epic','legendary']` | 2.400 | +0.400 |
| legendary | `['rare','epic']` | 2.222 | `['epic','legendary']` | 3.333 | +1.111 |

`E` is the expected quality of a rarity array under `getWeightedRarity`
(`src/systems/equipment/helpers.ts:49-81`), which rolls a rarity from the array weighted **50 basic /
35 rare / 10 epic / 5 legendary**, normalised over only the rarities present — scored here as
basic=1, rare=2, epic=3, legendary=4. E.g. `['rare','epic','legendary']` normalises 35/10/5 over a
sum of 50, giving 70% rare, 20% epic, 10% legendary, for `0.70×2 + 0.20×3 + 0.10×4 = 2.400`.
`margin` is `E(fight) − E(safe)`; both the safe and fight columns ascend strictly tier over tier, and
every margin is positive.

Within a tier, the encounter array now dominates the safe array rarity by rarity, not just on
average — at hard, safe is 100% rare while fighting is 70/20/10 rare/epic/legendary, so fighting
strictly improves every rarity's odds, never just the mean. `loot.money` is untouched (flat
20/30/40/50 per tier); the risk premium lives entirely in rarity.

## Why

Losing a fight forfeits both the money and the loot (`rpgJobCommand` returns early on a loss,
`src/firebot/commands/rpg-job.ts:299-320`), so an encounter job has to pay more when it does pay.
Before this change it paid *less* on every tier above easy — verified with the real weighting
(`getWeightedRarity`, `src/systems/equipment/helpers.ts:49-81` applies 50/35/10/5 normalised over
whichever rarities are present), scoring basic=1..legendary=4: medium 1.607 fight vs 2.010 safe,
hard 1.602 vs 2.653, legendary 2.655 vs 3.333.

The mechanism: dropping a rarity from an array removes its weight from the pool the others share,
so a *shorter*, top-heavy array is worth *more* than a longer one that reaches the same ceiling.
`['epic','legendary']` is a 33% legendary roll; `['basic','rare','epic','legendary']` is only 5%.
The safe jobs (ids 1, 2, 4, 59–66) were added over time and happened to get the short arrays; there
was never a table, so nothing kept the two sides consistent.

The fight side had its own broken rung for the same reason — ids 57/58 (hard-tier, encounter) were
carrying `['basic','rare']`, so hard fight jobs (1.602) paid below medium fight jobs (1.607). A
nerf-only fix (only touching the 11 safe jobs) could not close that gap: the value set is lumpy
(1.000, 1.412, 1.579/2.000, 1.700, 2.222, 2.400, 3.333) with nothing between 1.700 and 2.222, so
pulling hard's safe value under the old 1.602 fight value left only a 0.023 margin — invisible in
play — and did nothing for the medium/hard rung. Both sides needed to move.

## Ruled out

- **Nerfing only the safe jobs.** Caps hard's margin at +0.023 and leaves medium/hard fight jobs
  inverted against each other.
- **Money as the lever instead of rarity.** Items are what players chase; a currency gap is a
  weaker pull toward risk, and money already carries guild-level and happiness multipliers on top.
- **Keeping per-job variety within a tier.** The old spread inside hard fight jobs alone
  (1.412 / 1.579 / 1.700) is imperceptible in any single roll and is exactly what let the
  inversion happen unnoticed — a canonical table removes the room for that drift.
- **Hard safe = `['basic','rare','epic']`.** Gave a healthy margin (+0.821) but meant 52.6% of
  hard-tier safe payouts were basic items — too weak a reward for that tier regardless of the
  margin over fighting.
- **Hard safe = `['rare','epic']`.** Flattens the safe ladder against legendary (both land at
  2.222 — reaching legendary tier stops improving safe jobs at all), cuts the fight margin to
  +0.178, and *lowers* the epic chance when fighting (22.2% safe vs 20.0% fight) — reproducing the
  same dilution effect this decision exists to remove, just at a smaller scale. `['rare']` avoids
  all three: margin +0.400, ladder strictly ascends, and fighting improves every rarity.

## Accepted tradeoff

This buffs the economy at medium tier and up — every fight-job rarity array in those tiers moved
up, none moved down. Legendary drop rates roughly double at hard (2.1% → 10.0%) and at legendary
(16.4% → 33.3%). The legendary item pool is one entry deep for weapons, armor and shields (only
Longsword, Plate, and Tower Shield respectively), so a meaningful share of hard/legendary rewards
will repeat those three items until that pool is expanded — a pre-existing content gap this change
makes visible rather than causes, tracked separately from #28.

No `resetId` bump, per `docs/decisions/balance-fixes-dont-force-a-reset.md` — this is a balance
change to existing character power, and the decision to reset a live world stays with the operator.
