# Parallel Development: Quick Start Card

## Your Setup ✅

```
Main Repo (Controller)
└─ /Users/Surya/Projects/untab/untab-pomodoro [feat/tab-history]

Worktree 1: Tab History
└─ ~/.cursor/worktrees/untab-pomodoro/tab-history [feat/tab-history]

Worktree 2: Blacklist Tabs
└─ ~/.cursor/worktrees/untab-pomodoro/blacklist-tabs [feat/blacklist-tabs]
```

---

## For Agent 1: Tab History Feature

### Quick Start
```bash
cd ~/.cursor/worktrees/untab-pomodoro/tab-history
npm run build           # Build once
npm run watch          # Watch mode for continuous development
# Edit files... test in Chrome...
git add .
git commit -m "feat: [tab-history] your message"
git push origin feat/tab-history
```

### Load in Chrome
- `chrome://extensions/` 
- Load unpacked: `~/.cursor/worktrees/untab-pomodoro/tab-history`

---

## For Agent 2: Blacklist Tabs Feature

### Quick Start
```bash
cd ~/.cursor/worktrees/untab-pomodoro/blacklist-tabs
npm run build           # Build once
npm run watch          # Watch mode for continuous development
# Edit files... test in Chrome...
git add .
git commit -m "feat: [blacklist-tabs] your message"
git push origin feat/blacklist-tabs
```

### Load in Chrome
- `chrome://extensions/`
- Load unpacked: `~/.cursor/worktrees/untab-pomodoro/blacklist-tabs`

---

## Status Checks (From Main Repo)

```bash
cd /Users/Surya/Projects/untab/untab-pomodoro

# See all branches and worktrees
git worktree list

# Check what's on main
git log --oneline -5 origin/untab-pomodoro

# Fetch latest updates
git fetch origin
```

---

## Common Commands

| Task | Command |
|------|---------|
| Enter tab-history | `cd ~/.cursor/worktrees/untab-pomodoro/tab-history` |
| Enter blacklist-tabs | `cd ~/.cursor/worktrees/untab-pomodoro/blacklist-tabs` |
| Check status | `git status` |
| View recent commits | `git log --oneline -5` |
| Commit work | `git add . && git commit -m "..."` |
| Push to GitHub | `git push origin [branch-name]` |
| Sync with main | `git merge origin/untab-pomodoro` (then resolve conflicts) |
| See all worktrees | `git worktree list` |

---

## Creating a PR

After pushing your feature branch:

1. Visit: https://github.com/suryaatm21/untab
2. You should see a "Compare & pull request" button
3. Set base to: `untab-pomodoro`
4. Set compare to: `feat/tab-history` (or `feat/blacklist-tabs`)
5. Add description referencing `docs/TESTING_CHECKLIST.md`
6. Submit!

---

## Key Points

✅ Work independently - no blocking  
✅ Both agents can commit/push simultaneously  
✅ Changes stay isolated in each worktree  
✅ Easy to test both features in separate Chrome windows  
✅ Clean git history with clear commit messages  

For detailed guidance, see: `PARALLEL_DEVELOPMENT_GUIDE.md`
