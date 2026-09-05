# Balance-affecting bug fixes don't force a `resetId` reset

**Date:** 2026-09-05
**Status:** Active
**Related:** #6, PR #18

## Decision

When a bug fix changes existing character power (a nerf or buff), the fix ships without
bumping the `resetId` setting. Whether to reset characters is left entirely to the person
running the script, called out in release notes so they can make that call for their own
community.

## Why

Resetting the game is more disruptive to players than a stat change. `resetId` is
appropriate at different times for different communities depending on how far along their
players are — a server early in a season absorbs a reset easily, a long-running one does
not. That context only exists on the operator's side, not in this repo, so the repo should
not decide it for them.

## Ruled out

Bundling a `resetId` bump with the balance-fixing commit itself (i.e. resetting the
maintainer's own game as part of landing the fix). Rejected because it imposes one
operator's disruption tolerance on every other installation of the script.
