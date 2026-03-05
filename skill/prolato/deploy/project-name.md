# Project Name Selection

## Step 1: Project Name

Ask the user for the project name. Suggest a name derived from the current folder (e.g., if the folder is called `my-app`, suggest `my-app`).

### Name Validation

The name MUST comply with all these rules:

- Only characters `[a-z0-9-]` (lowercase, numbers, hyphens)
- Maximum length: 63 characters
- CANNOT start with a hyphen `-`
- CANNOT end with a hyphen `-`

If the name is not valid, ask the user to choose another one explaining which rules were violated.

### Availability Check

After validation, verify the name is not already in use:

```bash
curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: token {USER_TOKEN}" \
    "{GITEA_URL}/api/v1/repos/{username}/{project_name}"
```

- If it responds `200` → the project already exists. Ask the user if they want to overwrite it (re-deploy) or choose another name.
- If it responds `404` → the name is available, proceed.
