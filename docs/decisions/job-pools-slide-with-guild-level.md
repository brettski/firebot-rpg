# Job difficulty pools slide with guild level, with a small spillover chance

**Date:** 2026-09-11
**Status:** Active
**Related:** #5

## Decision

`selectJob()` picks from a two-tier sliding window: the guild's currently unlocked difficulty
tier plus the one directly below it (easy → easy; medium → easy+medium; hard → medium+hard;
legendary → hard+legendary). On top of that, a small configurable chance
(`jobSpilloverChance`, default 5%) rerolls the pick from the *next locked* tier instead, giving
players an occasional early look at harder content. Non-combat jobs (`encounter: null`) were
added to the medium, hard, and legendary tiers so the sliding window never leaves a guild band
without a safe option — previously all four non-combat jobs were easy-tier only.

## Why

The original code was additive by construction (each unlocked tier's jobs piled on top of the
one before it, though a mechanical bug meant none of it actually worked — see #5). An additive
pool dilutes forever: at max guild level most rolls would still land on easy jobs, so
progression wouldn't be felt. A sliding window makes each guild upgrade change what a player
actually sees.

Guild level rises slowly — roughly one level per six world-research completions, since
`upgradeBuilding()` (`src/systems/world/world-cycle.ts`) only fires at 100 research and
upgrades the lowest of six buildings, not the guild specifically. A pure sliding window would
make the long plateau between upgrades feel completely static, so the spillover chance gives a
taste of what's coming without unlocking it early.

## Ruled out

**The additive pool from the original (broken) code / issue #5's proposed fix.** Keeps every
lower tier's jobs in the pool forever once unlocked, so higher guild levels dilute rather than
replace. Rejected because progression stops being perceptible past the first couple of guild
levels.

**A full weighted roll across every unlocked tier** (e.g. 50/30/15/5 weights spanning easy
through the current band). Considered as a way to get both a dominant tier and a
"peek at everything below it" feel in one mechanism. Rejected as more machinery — and more
settings surface — than the two-tier window plus a single spillover percentage needs to
achieve the same effect.
