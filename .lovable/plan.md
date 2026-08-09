PR 309 is missing from the local workspace

## Diagnosis
- PR 309 on GitHub (`jodombrown/dna-May-2026`) is **merged** at 2026-08-09 19:33:50 UTC.
- Merge commit SHA on GitHub: `76ddec4e6745bea589a75a13a364f0bf77aa96a0`.
- The local Lovable branch is at `e739f7aa6` (Merge pull request #308), which is the exact base of PR 309's merge.
- Conclusion: GitHub merge is complete, but the Lovable workspace has not yet synced the latest GitHub `main` into the current branch.

## PR 309 scope
- Title: "Consolidate mobile hub chrome into DnaMobileHubShell"
- 7 files changed, 44 insertions, 50 deletions.
- Touches: `ConveyStoryHub`, `ContributeHub`, `ContributeShell`, `DnaMobileHeader`, `useMobileHeaderHeight`, and `appChromeSafeArea.test.tsx`.

## Plan
1. Sync the latest GitHub `main` into the Lovable workspace so the local branch includes the merge commit `76ddec4e...`
2. Verify the local branch now contains PR 309's changes by checking git log or the affected files.
3. If the Lovable preview is stale after the sync, restart the dev server and confirm the mobile hub chrome refactor is live.

## Verification
- `git log --oneline -5` should show `76ddec4e...` or the merge commit after the current `e739f7aa6`.
- The files changed in PR 309 should reflect the new `DnaMobileHubShell` wrapper in `ConveyStoryHub` and `ContributeHub`.

## Out of lane
This is a GitHub sync / repository state issue. If the sync requires a merge conflict resolution or git history rewrite, it belongs to the Claude Code lane.
