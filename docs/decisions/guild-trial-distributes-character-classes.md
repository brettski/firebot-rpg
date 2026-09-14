# Character classes are distributed through a paid guild trial, not job loot

**Date:** 2026-09-13
**Status:** Active
**Related:** #10, #26

## Decision

Players obtain a character class through `!rpg guild trial <basic|rare|epic|legendary>`: pay a
non-refundable, guild-level-gated fee to fight a champion monster whose class is forced to the
chosen tier, and take that class on a win. No job in `data/jobs.ts` awards `characterClass` loot.

The fee is indexed to the player's own highest trained stat, not a flat number:
`fee = max(tierFloor, (highestStat - 9) * baseCost * tierMultiplier)`, then passed through
`calculateShopCost` (the world's resources discount/surcharge) and re-floored afterward.

## Why

Class bonuses are **percentages** (`characters.ts:37-47`), so the same class is worth roughly
10x more to a heavily-trained character than a fresh one. A flat price is wrong at one end or
the other; indexing to the trainer's own `(stat - 9)` term lets a new player in a mature,
high-guild-level world still afford a basic trial cheaply, while the same fee is a serious sum
for a maxed character.

Forcing the champion's class to the trial's tier, rather than letting it roll naturally, makes
difficulty and reward the same dial: a legendary champion is hard *because* it wears a legendary
class, and beating it is what proves the player deserves that class. This also reuses the
monster generation and combat systems almost entirely as-is (`monster-generation.ts`,
`combat.ts`) rather than inventing a second acquisition mechanism from scratch.

No trial tier is available below guild level 1 — a fresh world has zero class access until then.
Guild is deterministically the 4th of 6 buildings ever upgraded from a fresh world (the
`upgradeBuilding()` tie-break resolves ties to the earliest key in `upgrades`' insertion order,
`world-stats.ts`), so this delay is fixed and plannable, not a source of bad-luck variance. This
was weighed against jobs, whose easy tier needs no guild level at all — trials were kept stricter
because a class is a much larger, permanent stat swing than a single piece of gear.

Two implementation findings worth recording here since they weren't anticipated in planning:

- **The fee floor must be re-applied after `calculateShopCost`.** The world's resources discount
  (up to -25%) is applied after the base fee is computed, so a floor checked only inside
  `calculateTrialFee` can be discounted below itself — the same class of bug as #22. Fixed with a
  separate `applyTrialFeeFloor` step run after the shop-cost discount.
- **`strictNullChecks` is off in `tsconfig.json`.** Making `Character.trial` optional (required
  because `verifyUser` never backfills fields onto existing characters) does not get compiler
  protection against an unguarded `character.trial.time` read — that line will compile and throw
  at runtime for every pre-existing character. The defensive `?.` is a convention to maintain by
  hand, not something tsc enforces.

## Ruled out

**Job loot** (add `itemType: 'characterClass'` to some job entries). The original plan for #10;
fully designed, then rejected in favor of the trial because it makes a class just another random
drop rather than something earned, and it would have collided with the job loot table's existing
risk/reward issues (see #28).

**Plain guild commission** (pay, no fight, get a random class of the tier). Simpler, but a pure
vending machine — the fee buys the outcome directly rather than the player proving anything.
Kept as a fallback design if the combat-gated trial proves too slow in practice.

**Learn the class a defeated monster wore** (passive job drop). Smallest possible change, but
`allowedMonsterRarity` caps monster gear at epic (`monster-generation.ts`), a deliberate cap this
issue was told not to change, so legendary classes would stay unreachable through that path alone.

**Milestone award at a guild rank**, **guild seal currency**, and **pick-one-of-three** offers —
each considered and rejected in the earlier design exploration
(`~/.claude/plans/issue-10-class-distribution-mechanics.md`) for lacking agency, being
disproportionate scope for this issue, or being an awkward chat interaction, respectively.

**Unlocking the basic tier at guild level 0**, to mirror how jobs gate their own tiers. Rejected
to keep classes — a larger permanent power gain than any single item — gated behind at least one
guild upgrade, accepting the fixed early-game delay described above.
