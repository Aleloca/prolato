---
name: prolato-setup
description: Initial setup for a new Prolato user
---

# Prolato User Setup

This sub-skill runs only the first time a user uses Prolato. It configures everything automatically.

## Prerequisites

The system admin must provide you with:
- The Gitea server URL (e.g., `https://git.yourdomain.dev`)
- The webhook URL (e.g., `https://webhook.yourdomain.dev`)
- The webhook deploy token
- The Gitea admin token (only for first-time setup — needed to create your account)
- The domain (e.g., `yourdomain.dev`)

## Step 1: Gather Information

Ask the user for ONLY this information:
- **Full name** (for Git commits, e.g., "John Doe")
- **Email** (for Git commits, e.g., "john@company.com")
- **Domain** of the Prolato server (e.g., "prolato.dev")
- **Deploy token** for the webhook
- **Gitea admin token** (if the user is the admin setting up the system for the first time)

## Step 2: Generate SSH Key

Check if a dedicated key already exists. If not, generate one.

```bash
if [ ! -f ~/.ssh/deploy_key ]; then
    ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N "" -C "deploy-$(whoami)"
    echo "SSH key generated: ~/.ssh/deploy_key"
else
    echo "SSH key already exists: ~/.ssh/deploy_key"
fi
```

Type `ed25519` (more secure and compact than RSA). No passphrase to allow automatic deploys.

## Step 3: Configure SSH for Gitea

Add or update the Gitea block in `~/.ssh/config`:

```
Host git.{DOMAIN}
    HostName git.{DOMAIN}
    Port 2222
    User git
    IdentityFile ~/.ssh/deploy_key
    IdentitiesOnly yes
    StrictHostKeyChecking no
```

- Port `2222`: the Gitea SSH port (configured on the server).
- `StrictHostKeyChecking no`: avoids the confirmation prompt on first connection.
- Check if the block already exists before adding it. If it exists, update it.

## Step 4: Create Gitea Account

Generate username and password, then create the account via admin API.

```bash
# Generate username from name (e.g., "John Doe" → "john.doe")
# Use only lowercase letters, dots to separate
# If already taken, add numeric suffix (john.doe.2)

# Generate random password
GITEA_PASSWORD=$(openssl rand -hex 16)

# Create user via admin API
curl -s -X POST "https://git.{DOMAIN}/api/v1/admin/users" \
    -H "Authorization: token {ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "{USERNAME}",
        "email": "{EMAIL}",
        "password": "'$GITEA_PASSWORD'",
        "must_change_password": false,
        "visibility": "private"
    }'
```

Check the response. If it returns a "user already exists" error, the account already exists — proceed to the next step using existing credentials or ask the user.

## Step 5: Generate User Token and Add SSH Key

```bash
# Generate Gitea user token
USER_TOKEN=$(curl -s -X POST "https://git.{DOMAIN}/api/v1/users/{USERNAME}/tokens" \
    -u "{USERNAME}:$GITEA_PASSWORD" \
    -H "Content-Type: application/json" \
    -d '{"name": "deploy-token", "scopes": ["write:repository", "write:user"]}' | grep -o '"sha1":"[^"]*"' | cut -d'"' -f4)

# Read the public key
SSH_PUBLIC_KEY=$(cat ~/.ssh/deploy_key.pub)

# Add the SSH key to the Gitea account
curl -s -X POST "https://git.{DOMAIN}/api/v1/user/keys" \
    -H "Authorization: token $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"deploy-key-$(hostname)\", \"key\": \"$SSH_PUBLIC_KEY\"}"
```

If the key already exists ("key already exists" error), that's fine — continue.

## Step 6: Configure Local Git

```bash
# Check if a global Git configuration already exists
EXISTING_NAME=$(git config --global user.name 2>/dev/null)

if [ -z "$EXISTING_NAME" ]; then
    # No global config — set it up
    git config --global user.name "{NAME}"
    git config --global user.email "{EMAIL}"
else
    # Global config exists — do NOT overwrite
    # The skill will use local config for each project
    echo "Git already configured as: $EXISTING_NAME"
    echo "The skill will use local configuration for each deployed project."
fi
```

## Step 7: Save Configuration

Write the file `~/.deploy-config.json`:

```json
{
    "gitea_url": "https://git.{DOMAIN}",
    "gitea_username": "{USERNAME}",
    "gitea_token": "{USER_TOKEN}",
    "gitea_admin_token": "{ADMIN_TOKEN}",
    "webhook_url": "https://webhook.{DOMAIN}",
    "deploy_token": "{DEPLOY_TOKEN}",
    "domain": "{DOMAIN}",
    "ssh_key_path": "~/.ssh/deploy_key"
}
```

Set restrictive permissions: `chmod 600 ~/.deploy-config.json`

## Step 8: Connection Test

Run all three tests. All must pass.

```bash
# 1. SSH test to Gitea
ssh -T git@git.{DOMAIN} -p 2222 -o ConnectTimeout=5 2>&1

# 2. Gitea API test
curl -s -H "Authorization: token {USER_TOKEN}" \
    "https://git.{DOMAIN}/api/v1/user" | grep -q '"login"'

# 3. Webhook test
curl -s -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "https://webhook.{DOMAIN}/health" | grep -q '"ok"'
```

### If All Pass

Display:
```
Setup complete!
- Gitea account: {USERNAME}
- Domain: {DOMAIN}
- You can now deploy your projects with "deploy this project"
```

### If One Fails

Show the specific error and suggest fixes:
- SSH fails → "Verify that the Gitea server is reachable and that port 2222 is open"
- Gitea API fails → "Verify that the Gitea URL is correct and that the token is valid"
- Webhook fails → "Verify that the webhook is active and that the deploy token is correct"
