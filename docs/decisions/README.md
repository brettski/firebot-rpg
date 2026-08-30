# Decision records

One file per decision. These capture *why* a choice was made — the part that git history
and the issue tracker both lose.

## Format

Filename: kebab-case, naming the decision itself rather than the topic area —
`job-pools-stay-additive.md`, not `jobs.md`.

    # <Decision, stated as what was chosen>

    **Date:** YYYY-MM-DD
    **Status:** Active | Superseded by <filename>
    **Related:** #<issue>, <commit>   (omit if none)

    ## Decision
    One or two sentences. What was chosen.

    ## Why
    The reasoning that would otherwise be lost. Be specific about the tradeoff accepted.

    ## Ruled out
    What else was considered, and why it lost. Omit only if nothing else was on the table.

## Guidelines

- Keep records short. Anything over roughly a screen will not get read.
- **"Ruled out" is the most valuable section and the easiest to skip.** A record that only
  says what was chosen does not stop the choice being relitigated six months later.
- Do not edit a superseded record's reasoning. Set `Status: Superseded by <file>` and write
  a new one — the original reasoning is the point.
- Use absolute dates (`2026-08-29`), never "today" or "last week".
