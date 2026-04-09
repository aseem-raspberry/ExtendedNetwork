---
name: git-github
description: Skill for managing Git version control and GitHub operations — committing, branching, pushing, creating repos, and PR workflows.
---

# Git & GitHub Operations Skill

This skill covers all common Git and GitHub CLI (`gh`) operations for this project. Follow these instructions when performing version control tasks.

---

## Prerequisites

- **Git** must be installed (`git --version`).
- **GitHub CLI** (`gh`) must be installed (`brew install gh` on macOS).
- **Authentication**: The user must be logged in via `gh auth login` before any GitHub operations. Check with `gh auth status`. If not authenticated, ask the user to run `gh auth login` in their own terminal — the interactive flow does not work in non-TTY environments.

---

## 1. Checking Repository State

Always check the state before making changes:

```bash
# Current branch and status
git status

# View existing remotes
git remote -v

# View recent commit history
git log --oneline -10

# View all branches
git branch -a
```

---

## 2. Staging & Committing

### Stage specific files
```bash
git add <file1> <file2> ...
```

### Stage all changes
```bash
git add -A
```

### Commit with a message
```bash
git commit -m "type: short description"
```

### Commit conventions
Use conventional commit prefixes:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `style:` — formatting, no logic change
- `refactor:` — code restructuring
- `chore:` — tooling, deps, config
- `test:` — adding or updating tests

**Example:**
```bash
git commit -m "feat: add force-directed graph layout with d3"
```

---

## 3. Creating a GitHub Repository

### Create a new public repo and push
```bash
# Create the repo on GitHub (use the user's GitHub username)
gh repo create <username>/<repo-name> --public --source=. --remote=origin --push

# Example for this project:
gh repo create aseem-raspberry/ExtendedNetwork --public --source=. --remote=origin --push
```

### Key flags
| Flag | Purpose |
|---|---|
| `--public` / `--private` | Repository visibility |
| `--source=.` | Use the current directory as the source |
| `--remote=origin` | Name for the remote |
| `--push` | Push immediately after creating |
| `--description "..."` | Add a repository description |

### If remote already exists
```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/<username>/<repo-name>.git

# Push with upstream tracking
git push -u origin main
```

---

## 4. Pushing Changes

```bash
# Push current branch
git push

# Push and set upstream (first push of a new branch)
git push -u origin <branch-name>

# Force push (use with extreme caution)
git push --force-with-lease
```

---

## 5. Branching

```bash
# Create and switch to a new branch
git checkout -b <branch-name>

# Switch to an existing branch
git checkout <branch-name>

# Delete a local branch
git branch -d <branch-name>

# Delete a remote branch
git push origin --delete <branch-name>
```

### Branch naming conventions
- `feature/<short-description>` — New features
- `fix/<short-description>` — Bug fixes
- `docs/<short-description>` — Documentation updates
- `chore/<short-description>` — Maintenance tasks

---

## 6. Pull Requests

### Create a PR from the current branch
```bash
gh pr create --title "feat: add graph canvas" --body "Description of changes" --base main
```

### List open PRs
```bash
gh pr list
```

### Merge a PR
```bash
gh pr merge <pr-number> --squash --delete-branch
```

---

## 7. Pulling & Syncing

```bash
# Pull latest changes
git pull origin main

# Fetch without merging
git fetch origin

# Rebase current branch onto main
git rebase main
```

---

## 8. Handling .env and Secrets

**NEVER commit `.env` files or secrets.** The `.gitignore` in this project already excludes `.env*` files. Always verify before committing:

```bash
# Check that .env files are ignored
git status  # should NOT show .env.local or similar

# If accidentally staged
git reset HEAD .env.local
```

---

## 9. Common Workflows

### Initial setup (new project → GitHub)
```bash
git init
git add -A
git commit -m "chore: initial commit"
gh repo create <username>/<repo-name> --public --source=. --remote=origin --push
```

### Daily development cycle
```bash
git pull origin main                    # sync
git checkout -b feature/my-feature      # branch
# ... make changes ...
git add -A
git commit -m "feat: describe change"
git push -u origin feature/my-feature
gh pr create --title "feat: ..." --body "..." --base main
```

### Quick commit & push (on main, solo project)
```bash
git add -A
git commit -m "type: description"
git push
```

---

## 10. Troubleshooting

### "gh: not authenticated"
Ask the user to run `gh auth login` in their terminal manually — interactive auth does not work in non-TTY agent terminals.

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/<username>/<repo-name>.git
```

### "non-fast-forward" push rejection
```bash
git pull --rebase origin main
git push
```

### Large files blocking push
Add large files to `.gitignore` or use Git LFS:
```bash
git lfs track "*.psd"
git add .gitattributes
```

---

## Project-Specific Notes

- **GitHub account**: `aseem-raspberry` (https://github.com/aseem-raspberry)
- **Default branch**: `main`
- **Files to never commit**: `.env*`, `node_modules/`, `.next/`, `.DS_Store`
- **Repository**: `ExtendedNetwork` (Gotaavalaa — Personal Network Graph app)
