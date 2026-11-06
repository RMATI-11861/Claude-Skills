# Git recovery scenarios

Create the backup ref first (`git branch backup/<yyyyMMdd-HHmm>`) whenever history will be rewritten. In PowerShell, quote revisions that contain braces, such as `'HEAD@{1}'`.

## Lost work
- **Commits lost after `reset --hard`, a rebase or a deleted branch.** Find the SHA with `git reflog`, then `git branch rescue <sha>`. Undo: `git branch -D rescue`.
- **Staged changes lost after `reset --hard`.** `git fsck --lost-found`, then `git show <sha>` on the dangling blobs. Changes that were never staged cannot be recovered by git; check the editor's local history.
- **Dropped stash.** `git fsck --no-reflog` lists dangling commits; inspect with `git show <sha>` and restore with `git stash apply <sha>`.
- **Commits made on a detached HEAD.** `git switch -c <branch>` before leaving, or find the SHA in `git reflog`.

## Wrong commits
- **Last commit wrong, not pushed.** `git reset --soft HEAD~1` keeps the changes staged. Undo: `git reset --soft ORIG_HEAD`.
- **Wrong message, not pushed.** `git commit --amend`. Undo: `git reset --soft 'HEAD@{1}'`.
- **Committed to the wrong branch, not pushed.** `git branch <right-branch>`, then on the wrong branch `git reset --hard HEAD~<n>` (after the backup ref), then `git switch <right-branch>`.
- **Bad commit already pushed.** `git revert <sha>` adds a new commit; no force-push needed. Undo: `git revert <revert-sha>`.
- **Merge to undo.** Pushed: `git revert -m 1 <merge-sha>`. Not pushed: `git reset --hard ORIG_HEAD`.

## Operations in progress
- Abort and return to the previous state: `git merge --abort`, `git rebase --abort`, `git cherry-pick --abort`.
- Rebase stopped on a conflict: resolve, `git add <files>`, `git rebase --continue`; `git rebase --skip` drops a commit that is already upstream.

## Leaked secret
1. Revoke or rotate the secret first; cleaning history does not un-leak it.
2. Not pushed: remove it with `git commit --amend`, or ask the user to run an interactive rebase.
3. Pushed: rewrite history with `git filter-repo --replace-text <file>` (separate tool) or BFG, coordinate the force-push with the team, and ask the hosting provider to purge cached views.
4. Prevent a repeat: add the file to `.gitignore` and use a pre-commit secret scanner.
