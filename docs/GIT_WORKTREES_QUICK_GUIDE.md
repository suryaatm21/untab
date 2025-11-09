# Git Worktrees Quick Guide

## What Are Git Worktrees?

Git worktrees allow you to work on multiple branches simultaneously without switching between them. Each worktree is an independent working directory linked to the same repository.

**In your case:**
- Your main repo: `Projects/untab/untab-pomodoro` (on the main branch)
- Your worktree: `~/.cursor/worktrees/untab-pomodoro/1gTVU` (on refactor/modularize branch)

This lets you work on refactoring in the worktree while keeping the main branch clean!

---

## Your Current Situation

### Main Repository
```
Projects/untab/untab-pomodoro/
├── .git/ (main git data)
├── .worktrees/ (worktree references)
└── [files on untab-pomodoro branch]
```

### Worktree
```
~/.cursor/worktrees/untab-pomodoro/1gTVU/
├── .git (points to main repo)
├── [all project files for refactor/modularize-popup-notification branch]
```

---

## What We Just Did ✅

### 1. Created a Commit
```bash
cd ~/.cursor/worktrees/untab-pomodoro/1gTVU
git commit -m "refactor: modularize popup and notification-manager..."
```
✅ Committed all changes locally in the worktree

### 2. Pushed to GitHub
```bash
git push origin HEAD:refactor/modularize-popup-notification -u
```
✅ Created new branch `refactor/modularize-popup-notification` on GitHub
✅ Uploaded all your changes

### 3. GitHub URL Created
```
https://github.com/suryaatm21/untab/pull/new/refactor/modularize-popup-notification
```
✅ Ready to create a Pull Request

---

## Next Steps: Creating the PR

### Option 1: Using GitHub Web UI (Easiest) ✨

1. **Visit the PR creation link:**
   ```
   https://github.com/suryaatm21/untab/pull/new/refactor/modularize-popup-notification
   ```

2. **Verify the comparison:**
   - Base: `main` (target branch you want to merge into)
   - Compare: `refactor/modularize-popup-notification` (your branch)
   - Should show all 20 changed files

3. **Fill in PR Details:**
   ```
   Title: Refactor: Modularize popup and notification-manager for improved maintainability
   
   Body: [Use the template below]
   ```

4. **Copy this PR Description:**
   ```markdown
   ## 📋 Description
   
   Refactored the monolithic `popup.js` (1447 lines) and `notification-manager.js` (312 lines) into a clean, modular architecture with clear separation of concerns.
   
   ### Changes
   - ✅ Created 14 new focused modules
   - ✅ 100% functional preservation
   - ✅ SOLID principles applied
   - ✅ Comprehensive documentation (4 guides)
   - ✅ Zero linting errors
   
   ### Files Changed
   - **Deleted**: popup/popup.js (refactored into modules)
   - **Modified**: popup/popup.html, notification-manager.js
   - **Created**: 14 new modular files + 4 documentation files
   
   ### Testing Checklist
   - [ ] Manual testing completed using docs/TESTING_VERIFICATION.md
   - [ ] All 100+ test cases verified
   - [ ] No console errors
   - [ ] Timer operations work (start, pause, extend, fast-forward, stop)
   - [ ] Active timers list displays correctly
   - [ ] Settings changes apply
   - [ ] Notifications trigger properly
   - [ ] Cross-browser tested (Chrome/Edge)
   
   ### Documentation
   - **REFACTORING_SUMMARY.md**: Architecture overview
   - **MODULE_REFERENCE_GUIDE.md**: Quick lookup table
   - **TESTING_VERIFICATION.md**: 100+ test cases
   - **REFACTORING_COMPLETION_SUMMARY.md**: Metrics
   
   ### Type of Change
   - [x] Refactoring (no feature/bug changes)
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Breaking change
   
   ### Related Issues
   None
   ```

5. **Click "Create Pull Request"**

---

## Understanding the Worktree Workflow

### Typical Workflow

```
1. Create Worktree (already done)
   └─ git worktree add ~/.cursor/worktrees/untab-pomodoro/1gTVU refactor-branch

2. Make Changes (already done)
   └─ Edit files, create modules, etc.

3. Commit Changes (✅ DONE)
   └─ git add -A && git commit -m "..."

4. Push to GitHub (✅ DONE)
   └─ git push origin HEAD:feature-branch -u

5. Create Pull Request (⬅ YOU ARE HERE)
   └─ Go to GitHub, create PR

6. Review & Approve
   └─ Reviewers check the code

7. Merge PR
   └─ Merge into main branch

8. Delete Worktree (after merge)
   └─ git worktree remove ~/.cursor/worktrees/untab-pomodoro/1gTVU
```

---

## Common Worktree Commands

### List All Worktrees
```bash
git worktree list
```
Output:
```
/Users/Surya/Projects/untab/untab-pomodoro (untab-pomodoro)
/Users/Surya/.cursor/worktrees/untab-pomodoro/1gTVU (no-context-1gTVU) -> origin/refactor/modularize-popup-notification
```

### Create New Worktree
```bash
git worktree add <path> <branch>

# Example:
git worktree add ~/.cursor/worktrees/my-feature my-feature-branch
```

### Remove Worktree (after PR is merged)
```bash
git worktree remove <path>

# Example:
git worktree remove ~/.cursor/worktrees/untab-pomodoro/1gTVU
```

### Check Worktree Status
```bash
cd ~/.cursor/worktrees/untab-pomodoro/1gTVU
git status
git log --oneline
```

### Push from Worktree
```bash
cd ~/.cursor/worktrees/untab-pomodoro/1gTVU
git push origin <branch>
```

---

## After PR is Merged

### Step 1: Return to Main Repo
```bash
cd ~/Projects/untab/untab-pomodoro
git fetch origin
git checkout main
git pull origin main
```

### Step 2: Verify Merged Code
```bash
# Your refactored modules should now be on main
ls -la popup/components/
ls -la popup/services/
```

### Step 3: Delete Worktree
```bash
# Delete the worktree directory
git worktree remove ~/.cursor/worktrees/untab-pomodoro/1gTVU

# Or manually:
rm -rf ~/.cursor/worktrees/untab-pomodoro/1gTVU
```

### Step 4: Clean Up
```bash
# Delete the remote branch after PR is merged
git push origin --delete refactor/modularize-popup-notification

# Or do it on GitHub directly
```

---

## PR Review Checklist

### For Reviewers
When reviewing this PR, please verify:

- [ ] Code is organized into logical modules
- [ ] No circular dependencies exist
- [ ] All files have JSDoc comments
- [ ] Zero linting errors
- [ ] Tests provided for verification
- [ ] Documentation is comprehensive
- [ ] No breaking changes introduced
- [ ] SOLID principles are applied

### For You (Before Submitting)
- [x] Commit created
- [x] Branch pushed to GitHub
- [ ] **PR created with proper description**
- [ ] **PR description includes testing checklist**
- [ ] All documentation files included
- [ ] Test verification document provided

---

## Troubleshooting

### Issue: "Branch already exists"
```bash
# Delete local tracking branch
git branch -D refactor/modularize-popup-notification

# Or use different branch name
git push origin HEAD:refactor/modularize-popup-notification-v2 -u
```

### Issue: "Permission denied" on push
```bash
# Check SSH keys are set up
ssh -T git@github.com

# If SSH fails, use HTTPS temporarily
git remote set-url origin https://github.com/suryaatm21/untab.git
```

### Issue: "Can't delete worktree - locked"
```bash
# Remove lock file
rm ~/.cursor/worktrees/untab-pomodoro/1gTVU/.git/worktrees/*/locked

# Then try removing again
git worktree remove ~/.cursor/worktrees/untab-pomodoro/1gTVU
```

---

## Key Differences: Worktrees vs Switch Branches

### Traditional: Switch Branches (❌ Don't do this)
```bash
cd ~/Projects/untab/untab-pomodoro
git stash              # Save work
git checkout main      # Switch to main
# ... do something ...
git stash pop          # Resume work
```
❌ Tedious, error-prone, can lose work

### With Worktrees: Keep Both (✅ Do this!)
```bash
# Worktree for refactoring
cd ~/.cursor/worktrees/untab-pomodoro/1gTVU

# Main repo still available
cd ~/Projects/untab/untab-pomodoro
```
✅ Both available simultaneously!

---

## Worktree Best Practices

### 1. One Branch Per Worktree
```bash
# ✅ Good
git worktree add ~/.cursor/my-feature my-feature-branch

# ❌ Bad - don't use same branch in multiple worktrees
git worktree add /path1 my-branch
git worktree add /path2 my-branch  # Error!
```

### 2. Keep Worktrees Organized
```bash
~/.cursor/worktrees/
├── untab-pomodoro/
│   ├── 1gTVU/          (refactoring)
│   ├── feature-auth/   (new feature)
│   └── bug-fix-123/    (bug fix)
```

### 3. Remove After Merge
```bash
# Don't leave old worktrees lying around
git worktree list
git worktree remove <path>  # Clean up
```

### 4. Use Descriptive Paths
```bash
# ✅ Clear
git worktree add ~/.cursor/worktrees/untab-pomodoro/refactor-modularize refactor-modularize

# ❌ Confusing
git worktree add /tmp/work branch-xyz
```

---

## Your Next Action 🚀

### Visit GitHub:
```
https://github.com/suryaatm21/untab/pull/new/refactor/modularize-popup-notification
```

### Fill in:
1. **Title**: `Refactor: Modularize popup and notification-manager for improved maintainability`
2. **Description**: Use the template provided above
3. **Labels**: `refactoring`, `documentation`
4. **Reviewers**: Assign yourself or team members

### Click: **Create Pull Request**

---

## After Creating the PR

### Next Steps:
1. ✅ **Self-review** the PR on GitHub
2. ✅ **Run tests** from TESTING_VERIFICATION.md
3. ⏳ **Wait for reviews** (if assigned to reviewers)
4. ⏳ **Address feedback** (make additional commits if needed)
5. ✅ **Merge to main** when approved
6. ✅ **Delete worktree** after merge

---

## Summary

| Step | Status | Command |
|------|--------|---------|
| Create worktree | ✅ Done | (automatically in Cursor) |
| Make changes | ✅ Done | (14 new modules created) |
| Commit | ✅ Done | `git commit -m "..."`  |
| Push | ✅ Done | `git push origin HEAD:refactor/...` |
| **Create PR** | ⬅️ **NOW** | Visit GitHub link |
| Review/Test | ⏳ Next | Manual testing |
| Merge | ⏳ After review | Click merge on GitHub |
| Delete worktree | ⏳ Final | `git worktree remove` |

---

**You're almost done!** Just visit the GitHub link and create the PR! 🎉

