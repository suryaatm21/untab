# Parallel Development with Git Worktrees

This guide explains how to work on multiple features simultaneously using git worktrees.

## Your Current Setup

You have **3 active directories** for Untab Pomodoro development:

### 1. Main Repository (Main Branch)
```
/Users/Surya/Projects/untab/untab-pomodoro
├── Branch: feat/tab-history
├── Status: Your "controller" repo
└── Use for: Coordination, status checks, branch management
```

### 2. Tab History Feature Worktree
```
~/.cursor/worktrees/untab-pomodoro/tab-history
├── Branch: feat/tab-history
├── Status: Ready for Agent to develop
└── Use for: Tab history feature implementation
```

### 3. Blacklist Tabs Feature Worktree
```
~/.cursor/worktrees/untab-pomodoro/blacklist-tabs
├── Branch: feat/blacklist-tabs
├── Status: Ready for Agent to develop
└── Use for: Blacklist/skip tabs feature implementation
```

---

## How It Works

### Scenario: Both Agents Working Simultaneously

```
Agent 1                           Agent 2
│                                 │
├─ cd ~/.cursor/worktrees/untab-pomodoro/tab-history
│  ├─ npm run build
│  ├─ Edit popup-main.js
│  ├─ Test timer history UI
│  └─ git add . && git commit
│
                                  ├─ cd ~/.cursor/worktrees/untab-pomodoro/blacklist-tabs
                                  ├─ npm run build
                                  ├─ Edit active-timers-list.js
                                  ├─ Add blacklist checkbox
                                  └─ git add . && git commit

[Both agents work independently, no blocking]
```

### Key Benefits

✅ **No blocking**: Agent 1 doesn't wait for Agent 2  
✅ **No stashing**: Changes stay in their own directory  
✅ **No merge conflicts during dev**: Each branch isolated  
✅ **Easy testing**: Each feature has its own node_modules and build  
✅ **Clean git history**: Commits stay organized per-branch  

---

## Workflow Instructions

### For Agent 1: Developing Tab History Feature

#### Step 1: Enter the Worktree
```bash
cd ~/.cursor/worktrees/untab-pomodoro/tab-history
```

#### Step 2: Build and Test
```bash
npm run build          # Compile your changes
npm run watch         # Watch mode (auto-rebuild on save)
```

#### Step 3: Open Chrome
```bash
chrome://extensions/ → Load unpacked → ~/.cursor/worktrees/untab-pomodoro/tab-history
```

#### Step 4: Make Changes
- Edit files in `popup/` or `background.js`
- Test in the loaded extension
- Verify no console errors

#### Step 5: Commit When Ready
```bash
git add .
git commit -m "feat: [tab-history] descriptive message"
git push origin feat/tab-history
```

---

### For Agent 2: Developing Blacklist Tabs Feature

#### Step 1: Enter the Worktree
```bash
cd ~/.cursor/worktrees/untab-pomodoro/blacklist-tabs
```

#### Step 2: Build and Test
```bash
npm run build
npm run watch
```

#### Step 3: Open Chrome
```bash
chrome://extensions/ → Load unpacked → ~/.cursor/worktrees/untab-pomodoro/blacklist-tabs
```

#### Step 4: Make Changes
- Edit files in `popup/` or `background.js`
- Test in the loaded extension
- Verify no console errors

#### Step 5: Commit When Ready
```bash
git add .
git commit -m "feat: [blacklist-tabs] descriptive message"
git push origin feat/blacklist-tabs
```

---

## Switching Between Worktrees

### Quick Switch from Main Repo
```bash
# From main repo to check tab-history worktree
cd ~/.cursor/worktrees/untab-pomodoro/tab-history
git status
git log --oneline -5

# Jump back to main repo
cd /Users/Surya/Projects/untab/untab-pomodoro
```

### Check Status of All Worktrees
```bash
cd /Users/Surya/Projects/untab/untab-pomodoro
git worktree list

# Output should show:
/Users/Surya/Projects/untab/untab-pomodoro          [feat/tab-history]
~/.cursor/worktrees/untab-pomodoro/tab-history      [feat/tab-history]
~/.cursor/worktrees/untab-pomodoro/blacklist-tabs   [feat/blacklist-tabs]
```

---

## Creating Pull Requests

### Agent 1: Tab History Feature
```bash
cd ~/.cursor/worktrees/untab-pomodoro/tab-history
git push origin feat/tab-history

# Then on GitHub:
# 1. Go to https://github.com/suryaatm21/untab
# 2. Click "New Pull Request"
# 3. Base: untab-pomodoro
# 4. Compare: feat/tab-history
# 5. Fill title/description and submit
```

### Agent 2: Blacklist Tabs Feature
```bash
cd ~/.cursor/worktrees/untab-pomodoro/blacklist-tabs
git push origin feat/blacklist-tabs

# Then on GitHub:
# 1. Go to https://github.com/suryaatm21/untab
# 2. Click "New Pull Request"
# 3. Base: untab-pomodoro
# 4. Compare: feat/blacklist-tabs
# 5. Fill title/description and submit
```

---

## Syncing with Main Branch

If `untab-pomodoro` (main) gets updated while you're developing:

### For Either Feature Branch
```bash
# In the main repo
cd /Users/Surya/Projects/untab/untab-pomodoro
git fetch origin
git log --oneline -3 origin/untab-pomodoro

# Then in your feature worktree, merge main
cd ~/.cursor/worktrees/untab-pomodoro/[your-feature]
git fetch origin
git merge origin/untab-pomodoro

# Resolve any conflicts and test
git add .
git commit -m "merge: sync with untab-pomodoro main"
git push origin [your-feature]
```

---

## Completing a Feature

### When Agent 1 Finishes Tab History

#### 1. Final Commit & Push
```bash
cd ~/.cursor/worktrees/untab-pomodoro/tab-history
git add .
git commit -m "feat: [tab-history] final implementation"
git push origin feat/tab-history
```

#### 2. Create PR on GitHub
- Base branch: `untab-pomodoro`
- Compare branch: `feat/tab-history`
- Include testing checklist from `docs/TESTING_CHECKLIST.md`
- Request review

#### 3. After PR is Merged
```bash
# Update main repo
cd /Users/Surya/Projects/untab/untab-pomodoro
git fetch origin
git pull origin untab-pomodoro

# Option A: Delete worktree (if feature is complete)
git worktree remove ~/.cursor/worktrees/untab-pomodoro/tab-history

# Option B: Keep worktree and create new feature from it
# (worktree will become "detached" but can be reused)
```

---

## Common Worktree Commands

### List All Worktrees
```bash
git worktree list

# More detailed:
git worktree list --porcelain
```

### Check Worktree Status
```bash
cd ~/.cursor/worktrees/untab-pomodoro/tab-history
git status                    # Current branch status
git log --oneline -10        # Recent commits
git diff origin/untab-pomodoro  # Changes relative to main
```

### Remove a Worktree (After PR Merged)
```bash
git worktree remove ~/.cursor/worktrees/untab-pomodoro/tab-history
```

### Force Remove a Worktree (if locked)
```bash
git worktree remove --force ~/.cursor/worktrees/untab-pomodoro/tab-history
```

### Repair Locked Worktree
```bash
git worktree repair
```

---

## Troubleshooting

### Issue: "Branch already exists at another location"
**Problem**: Tried to create a worktree for a branch already checked out elsewhere
**Solution**: Each branch can only exist in one place
```bash
# Use --force if you're sure:
git worktree add --force ~/.cursor/worktrees/untab-pomodoro/my-feature my-feature
```

### Issue: "Worktree is locked"
**Problem**: Previous agent session crashed or didn't clean up properly
**Solution**: 
```bash
git worktree lock ~/.cursor/worktrees/untab-pomodoro/tab-history  # to lock
git worktree unlock ~/.cursor/worktrees/untab-pomodoro/tab-history  # to unlock
git worktree repair  # automatic repair
```

### Issue: Both Features Need Changes to Same File
**Problem**: Both agents editing `popup.js` simultaneously
**Solution**: This is fine! Git handles it:
1. Each agent commits their changes independently
2. When merged to main, both get merged (or conflicts resolved)
3. Use descriptive commit messages to track changes:
   ```bash
   git commit -m "feat: [tab-history] add timer history display to popup.js"
   git commit -m "feat: [blacklist-tabs] add skip button to popup.js"
   ```

---

## Best Practices

### ✅ DO
- Commit frequently with clear messages
- Use branch prefixes: `feat: [feature-name]`
- Push daily (don't accumulate too many local commits)
- Test in Chrome extension before committing
- Sync with main weekly or after main updates
- Keep worktrees organized in `.cursor/worktrees/`

### ❌ DON'T
- Don't checkout the same branch in multiple worktrees
- Don't force-push unless absolutely necessary
- Don't mix unrelated changes in one commit
- Don't delete a worktree if you haven't pushed your changes
- Don't work on main branch directly (use branches only)

---

## Example: Full Parallel Development Session

```
Morning: Both agents start simultaneously

Agent 1 (Tab History):
$ cd ~/.cursor/worktrees/untab-pomodoro/tab-history
$ npm run watch
[Makes changes to popup/components/timer-display.js]
$ git add . && git commit -m "feat: [tab-history] add history panel component"
$ git push origin feat/tab-history

Agent 2 (Blacklist Tabs):
$ cd ~/.cursor/worktrees/untab-pomodoro/blacklist-tabs
$ npm run watch
[Makes changes to popup/components/active-timers-list.js]
$ git add . && git commit -m "feat: [blacklist-tabs] add skip button to timer list"
$ git push origin feat/blacklist-tabs

Midday: Main repo gets updated with another PR

Sync both features:
$ cd ~/.cursor/worktrees/untab-pomodoro/tab-history && git merge origin/untab-pomodoro
$ cd ~/.cursor/worktrees/untab-pomodoro/blacklist-tabs && git merge origin/untab-pomodoro

Late Afternoon: Features ready for review

Agent 1: Create PR for feat/tab-history
Agent 2: Create PR for feat/blacklist-tabs

Both PRs submitted and under review!
```

---

## Summary: Your Command Reference

| Task | Command |
|------|---------|
| See all worktrees | `git worktree list` |
| Enter tab-history | `cd ~/.cursor/worktrees/untab-pomodoro/tab-history` |
| Enter blacklist-tabs | `cd ~/.cursor/worktrees/untab-pomodoro/blacklist-tabs` |
| Build changes | `npm run build` |
| Watch mode | `npm run watch` |
| Commit changes | `git add . && git commit -m "..."` |
| Push to GitHub | `git push origin feat/tab-history` (or feat/blacklist-tabs) |
| Sync with main | `git merge origin/untab-pomodoro` |
| Delete worktree | `git worktree remove ~/.cursor/worktrees/untab-pomodoro/[name]` |

---

You're all set for parallel development! 🚀 Both agents can now work on their features independently without stepping on each other's toes.
