# Self-Service User Registration

**Date:** 2026-03-01
**Status:** Approved

## Problem

The current setup flow requires the system admin to share a Gitea admin token with every new user so the Prolato skill can programmatically create their Gitea account. This is a security concern — the admin token has full server-wide privileges and shouldn't be distributed.

## Design

### New User Onboarding Flow

1. **Admin provisions VPS** — runs `setup.sh`, keeps registration open (already the default)
2. **Admin shares with each user:** domain + deploy token (two values, no admin credentials)
3. **User self-registers on Gitea** — opens `https://git.{DOMAIN}`, creates their own account
4. **User creates API token** — from Gitea UI: Settings → Applications → Generate New Token (scopes: `write:repository`, `write:user`)
5. **User runs `/prolato`** — the setup skill asks for: name, email, domain, deploy token, Gitea username, Gitea token
6. **Skill configures SSH, Git, and saves config** — no admin API calls needed

### What Changes

| Before | After |
|--------|-------|
| Admin shares admin token with every user | Admin only shares domain + deploy token |
| Skill creates Gitea account via admin API | User self-registers on Gitea UI |
| Skill generates password, creates token via API | User creates own token from Gitea UI |
| `gitea_admin_token` in config | Field removed entirely |
| `DISABLE_REGISTRATION = true` recommended | Registration stays open |

### Setup Skill New Steps (7 total, down from 8)

1. **Gather Information** — ask for: name, email, domain, deploy token, Gitea username, Gitea token
2. **Generate SSH Key** — same as before
3. **Configure SSH for Gitea** — same as before
4. **Add SSH Key to Gitea** — use user's own token (no password-based auth)
5. **Configure Local Git** — same as before
6. **Save Configuration** — `~/.deploy-config.json` without `gitea_admin_token`
7. **Connection Test** — same as before

## Files to Change

### 1. `skill/prolato/setup/SKILL.md`
- Remove admin token from prerequisites
- Remove Step 4 (account creation via admin API)
- Update Step 1: ask for Gitea username + token instead of admin token
- Update Step 5: remove password-based token creation, use provided token directly
- Update Step 7: remove `gitea_admin_token` from config JSON
- Renumber steps (8 → 7)

### 2. `skill/prolato/config.example.json`
- Remove `gitea_admin_token` field

### 3. `setup/setup.sh`
- In `print_summary`, remove step 3 about disabling registration
- Renumber subsequent steps

### 4. `webapp/src/app/docs/setup/gitea/page.tsx`
- Change `DISABLE_REGISTRATION = true` to `false` in app.ini example
- Remove bullet point explaining registration is disabled after admin creation
- Update Step 8 text: clarify first user is admin, others register normally
- Update Step 9: explain this is for the admin's webhook token

### 5. `webapp/src/app/docs/skill/install/page.tsx`
- Remove `gitea_admin_token` row from config fields table
- Remove from JSON example
