# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Firebot RPG is a custom script for [Firebot](https://firebot.app) (a Twitch bot). It is not a standalone
application — it only runs loaded inside Firebot, driven by chat commands (`!rpg ...`) and Firebot's own
runtime (`RunRequest`) for chat, currency, user metadata, and settings storage. There is no server, no
database of its own, and no UI beyond Firebot's game-settings panel and chat messages.

This is a fork of `itsjesski/firebot-rpg` (originally "Firebottle") (v1), continued by Brett Slaski (v1.1+).

## Commands

- `npm run build` — webpack production build, bundles `src/main.ts` into `dist/Firebot-RPG.js` (single
  commonjs2 file, `libraryExport: 'default'`).
- `npm run build:dev` — build, then copy the built script into the local Firebot install's `scripts/`
  folder for the currently logged-in profile (via `scripts/copy-build.js`; macOS/Windows/Linux app-data
  paths are auto-detected).
- `npx eslint .` — lint (also runs automatically via husky pre-commit + lint-staged on staged
  `*.{js,jsx,ts,tsx}` files, with `eslint --fix` then `eslint`). **Currently checks only `src/main.ts`** —
  the config glob misses nested directories, so a clean lint run proves almost nothing. See issue #11.
- `npx prettier --write .` — formatting (`*.json` is auto-formatted by lint-staged on commit).
- `npx tsc --noEmit` — type-check without emitting (there is no separate `build:types` npm script).
  Reports ~49 pre-existing errors, all inside `node_modules/@dice-roller/rpg-dice-roller/types/`; zero
  originate in `src/`. Filter with `npx tsc --noEmit 2>&1 | grep '^src/'` to see only real errors.

There is no test runner configured (no `test` script, no jest config, no `*.test.ts` files) despite
`ts-jest` being a devDependency — don't assume a test suite exists.

## Architecture

### Layering

```
src/main.ts                      Firebot script entry point (getScriptManifest/run)
src/firebot/                     Firebot integration layer — the ONLY place that talks to the Firebot API
  firebot.ts                     Holds the injected RunRequest; wraps all Firebot module calls
                                  (logger, chat, userDb, currencyDb, commandManager, gameManager)
  games/register-game.ts         Registers the game, defines all in-Firebot settings (settingCategories),
                                  wires onLoad -> registerCommands + verifyWorld + startGameCycle
  commands/                      One file per `!rpg <subcommand>`, registered in register-commands.ts
src/systems/                     Game logic — pure(ish) domain code, no direct Firebot API calls
  characters/, combat/, duels/, equipment/, monsters/, shops/, user/, world/
  cycle.ts                       setInterval loop driving world-cycle.ts
  settings.ts                    Typed getters over the raw GameSettings from firebot.ts
src/data/                        Static game content as TS literals (weapons, armor, spells, classes,
                                  monsters, jobs, titles, enchantments, shields) — large lookup tables,
                                  each item has a numeric `id` used everywhere else as a reference
src/types/                       Shared TypeScript types for equipment, users, world, jobs, monsters, settings
```

Rule of thumb: `src/firebot/*` is the only code allowed to import from
`@crowbartools/firebot-custom-scripts-types` module surfaces directly (userDb, currencyDb, twitchChat,
etc.) — everything else in `src/systems` goes through the wrapper functions in `src/firebot/firebot.ts`
(`getCharacterMeta`, `setCharacterMeta`, `sendChatMessage`, `getGameSettings`, `logger`, etc.).

### State model

Firebot has no first-class database for this script; all persistent state is stored as **user metadata**
via `userDb`:
- Per-player character state: `userDb.getUserMetadata(username, 'fbrpg-character')`
- World state: stored on the streamer's own user record under `'fbrpg-world'`

A `Character` (raw stored shape) only holds item references (`{ id, itemType, refinements, enchantments }`
per slot). `getCompleteCharacterData()` (`systems/characters/characters.ts`) hydrates a `Character` into a
`CompleteCharacter` by resolving each slot's `id` against the `src/data/*` lists via `getItemByID()`
(`systems/equipment/helpers.ts`) — this hydration step is required before most stat/combat calculations,
which read the `*Data` fields (`mainHandData`, `armorData`, etc.), not the raw ids.

### Command flow

`src/firebot/commands/register-commands.ts` registers a single Firebot system command `!rpg` with
subcommands as `SubCommand` metadata (for Firebot's help/cooldown system), and does its own dispatch by
`switch` on `args[0]` inside `onTriggerEvent`. Every invocation first calls `verifyUser()` to ensure/create
a character before running the subcommand handler. Each `rpg-*.ts` file under `commands/` is the thin
Firebot-facing wrapper that parses `userCommand.args` and calls into the matching `src/systems/*` module.

### World cycle

`registerRPG()` (`games/register-game.ts`) calls `verifyWorld()` then `startGameCycle()` on load.
`startGameCycle()` (`systems/cycle.ts`) runs `worldCycle()` on a `setInterval` at the configurable
`cycleTime` setting (seconds) — this drives world tendency/stat changes independent of chat commands.

### Settings

All tunable game numbers (combat formulas, shop cost curves, creature HP thresholds, cycle timing) are
defined as Firebot `SettingCategoryDefinition`s inline in `games/register-game.ts` and read back through
typed getters in `systems/settings.ts` (e.g. `getHitBonusSettings`, `getDamageBonusSettings`,
`getWorldCycleTimeSettings`) — do not hardcode values that already exist as a setting there.

### Combat

`systems/combat/combat.ts` computes initiative, damage rolls, and damage bonuses; `approach.ts` handles
the ranged-approach phase (armor-weight-based movement speed), `melee.ts` the melee phase, `magic.ts`
spellcasting, `combat-hit.ts` hit/miss resolution. AC, elemental resistance, and hit/damage bonuses all
degrade over combat rounds (see the `roundCounter`-based "defense wears down after round 10" logic in
`characters/characters.ts`) — combat math functions take `roundCounter` as a parameter for this reason.

Dice rolling uses `@dice-roller/rpg-dice-roller` via `rollDice()` in `systems/utils.ts`, with damage/dice
strings like `"1d20 +2"` stored directly in the `src/data/*` tables.

## Known gaps

Open bugs live in the GitHub issue tracker (`gh issue list`). One is worth knowing before you read the
code, because it makes working code look broken and unused code look live:

- **Player character classes are unreachable.** `src/data/classes.ts` is live (monsters use it, and class
  bonuses feed every stat calculation), but no job awards `itemType: 'characterClass'`, so every player is
  permanently class id 1 and `equipClass()` in `rpg-equip.ts` is unreachable code. Do not "clean up"
  either as dead. Tracked in issue #10.

## Decisions

Design decisions specific to this codebase are recorded in `docs/decisions/`, one markdown
file per decision. See `docs/decisions/README.md` for the format.

Log a decision when the *reasoning* would not survive anywhere else — not in the code, not
in a GitHub issue, not in a commit message. Balance and gameplay choices are the main case
here: which job tiers a guild level unlocks, whether a fix warrants a `resetId` season
reset, how much loot a change should award. Those leave no trace in the code they produce.

- **Log it without asking** when the choice is settled and the reasoning is already clear.
- **Ask "Should I log this decision?"** when it is unclear whether the choice is final, or
  whether it is durable enough to warrant a file.
- **Do not log** anything the code states plainly, anything already captured in an issue, or
  routine implementation choices (naming, file placement, obvious refactors).

## Verification Policy

- Verify load-bearing claims — specific counts, file:line references, and assertions about what code does or how it behaves — against the actual code, docs, or command output before stating them; don't answer from memory alone when a tool can confirm it. Qualitative language ("small fix," "roughly") doesn't need the same rigor, but don't dress an unverified guess in a number that makes it sound checked.
- If something cannot be verified, say so directly ("I don't know" / "couldn't confirm this") instead of filling the gap with a plausible guess.
- Do not extrapolate beyond what the evidence supports. If the evidence only supports a narrower claim, state the narrower claim.
- Distinguish what was directly verified (read in code, confirmed by running a command) from what is inferred. Label inferences as inferences.
- Do not add confidence, framing, or detail beyond what was actually checked.
