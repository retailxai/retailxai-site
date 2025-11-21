# PRECIPICE_TOKEN Setup Guide

**Purpose:** Complete step-by-step instructions for creating and configuring the Personal Access Token (PAT) required for the Update Data workflow to access the private Precipice-2 repository.

**Status:** Operational Guide

← See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for navigation and canonical sources.

---

## Overview

The `Update Data` workflow in retailxai-site needs to checkout the private repository `retailxai/Precipice-2` to copy drafts and PDFs. This requires a Personal Access Token (PAT) with appropriate permissions stored as the `PRECIPICE_TOKEN` secret.

**Common Error:** If you see "Not Found" when the workflow tries to checkout Precipice-2, it means the token doesn't have access to that repository.

---

## Part A: Required Scopes for the Token

The PAT used for `PRECIPICE_TOKEN` must be created with at least these scopes:

### Required Scopes:
- **`repo`** - Full control of private repositories
  - This scope allows the token to read private repositories
  - Required to checkout `retailxai/Precipice-2`

### Optional but Recommended:
- **`workflow`** - Update GitHub Action workflows
  - Only needed if the workflow will ever push changes back to Precipice-2
  - Currently not required, but good to have for future flexibility

- **`read:org`** - Read organization membership
  - Only needed if your organization requires it
  - Check your organization's security policies

**Important:** Do NOT grant more permissions than necessary. The `repo` scope is sufficient for reading private repositories.

---

## Part B: Required Repository Permissions

The GitHub user account that owns the PAT must have access to the `retailxai/Precipice-2` repository.

### Step-by-Step: Grant Repository Access

1. **Navigate to the Precipice-2 repository:**
   - Go to `https://github.com/retailxai/Precipice-2` in your web browser
   - You must be logged in as an account that has admin access to this repository

2. **Open Repository Settings:**
   - Click the "Settings" tab at the top of the repository page
   - If you don't see a Settings tab, you don't have admin access

3. **Navigate to Collaborators or Access:**
   - In the left sidebar, look for one of these options:
     - **"Collaborators"** (for user-owned repositories)
     - **"Access"** or **"Teams"** (for organization repositories)
   - Click on it

4. **Add the PAT Owner Account:**
   - If adding a user account:
     - Click "Add people" or "Invite a collaborator"
     - Enter the GitHub username or email of the account that will own the PAT
     - Select the permission level: **Read** (minimum) or **Write** (if workflow needs to push)
     - Click "Add [username] to this repository"
   
   - If adding via team (organization):
     - Find or create a team that includes the PAT owner account
     - Grant the team at least **Read** access to Precipice-2
     - Ensure the PAT owner is a member of that team

5. **Verify Access:**
   - The account should receive an invitation email (if adding a new collaborator)
   - The account must accept the invitation
   - After acceptance, verify the account can see the repository at `https://github.com/retailxai/Precipice-2`

**Note:** If Precipice-2 is an organization repository, the PAT owner may also need:
- Membership in the `retailxai` organization
- Appropriate organization-level permissions (check organization settings)

---

## Part C: How to Create or Update the PRECIPICE_TOKEN Secret

### Step-by-Step: Create the Personal Access Token

1. **Log in to GitHub:**
   - Use the account that has access to `retailxai/Precipice-2`
   - This should be the same account you added as a collaborator in Part B

2. **Navigate to Personal Access Tokens:**
   - Click your profile picture in the top-right corner
   - Select "Settings"
   - In the left sidebar, scroll down and click "Developer settings"
   - Click "Personal access tokens" → "Tokens (classic)"
   - Or go directly to: `https://github.com/settings/tokens`

3. **Generate New Token:**
   - Click "Generate new token" → "Generate new token (classic)"
   - GitHub may prompt for your password

4. **Configure Token:**
   - **Note:** Give it a descriptive name like "retailxai-site Precipice-2 Access"
   - **Expiration:** Set an appropriate expiration (90 days, 1 year, or no expiration)
     - For production, consider using a machine account with a long expiration
     - For testing, use a shorter expiration
   - **Scopes:** Check the following:
     - ✅ **repo** (Full control of private repositories)
     - ✅ **workflow** (Update GitHub Action workflows) - optional but recommended

5. **Generate and Copy Token:**
   - Scroll to the bottom and click "Generate token"
   - **IMPORTANT:** Copy the token immediately - you won't be able to see it again
   - Store it securely (password manager, secure note, etc.)

### Step-by-Step: Store Token as Repository Secret

1. **Navigate to retailxai-site Repository:**
   - Go to `https://github.com/retailxai/retailxai-site`
   - You must have admin access to this repository

2. **Open Repository Settings:**
   - Click the "Settings" tab at the top

3. **Navigate to Secrets:**
   - In the left sidebar, click "Secrets and variables" → "Actions"
   - Or go directly to: `https://github.com/retailxai/retailxai-site/settings/secrets/actions`

4. **Create or Update Secret:**
   - Click "New repository secret" (if creating) or find `PRECIPICE_TOKEN` and click "Update" (if updating)
   - **Name:** `PRECIPICE_TOKEN` (must match exactly, case-sensitive)
   - **Secret:** Paste the PAT you copied in Part C, Step 5
   - Click "Add secret" or "Update secret"

5. **Verify Secret Exists:**
   - You should see `PRECIPICE_TOKEN` listed in the secrets table
   - The value will be masked (shown as dots)

**Important:** After updating the secret, any running workflows will continue using the old token. New workflow runs will use the updated token.

---

## Part D: Lightweight Verification Commands

Use these commands locally to verify that your PAT is valid and has the correct access before running the workflow.

### Prerequisites:
- `curl` installed on your system
- The PAT you created in Part C

### Verification Step 1: Check Token Owner

Replace `YOUR_PAT_HERE` with your actual PAT:

```bash
curl -H "Authorization: token YOUR_PAT_HERE" https://api.github.com/user
```

**Expected Result:**
- Returns JSON with user information including `login`, `id`, `type`
- If you see `"message": "Bad credentials"`, the token is invalid or expired

**Example Success Response:**
```json
{
  "login": "your-username",
  "id": 12345678,
  "type": "User",
  ...
}
```

### Verification Step 2: Check Access to Precipice-2

Replace `YOUR_PAT_HERE` with your actual PAT:

```bash
curl -H "Authorization: token YOUR_PAT_HERE" https://api.github.com/repos/retailxai/Precipice-2
```

**Expected Result (Success):**
- Returns JSON with repository information
- Look for `"full_name": "retailxai/Precipice-2"` in the response
- Should include fields like `name`, `private`, `default_branch`

**Example Success Response:**
```json
{
  "id": 123456789,
  "name": "Precipice-2",
  "full_name": "retailxai/Precipice-2",
  "private": true,
  "default_branch": "main",
  ...
}
```

**Expected Result (Failure - No Access):**
- Returns JSON with error message
- Look for `"message": "Not Found"`

**Example Failure Response:**
```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest"
}
```

**Troubleshooting:**
- If you get "Not Found", the token owner doesn't have access to Precipice-2
- Go back to Part B and ensure the account is added as a collaborator
- Verify the account accepted any invitation emails
- For organization repos, verify organization membership

### Verification Step 3: Check Default Branch

Replace `YOUR_PAT_HERE` with your actual PAT:

```bash
curl -H "Authorization: token YOUR_PAT_HERE" https://api.github.com/repos/retailxai/Precipice-2 | grep -o '"default_branch":"[^"]*"'
```

**Expected Result:**
- Should return `"default_branch":"main"` (or whatever the default branch is)
- This confirms the workflow can determine the branch to checkout

---

## Part E: Final Workflow Test Procedure

After completing Parts A-D, test the workflow to ensure everything works.

### Step 1: Verify Secret is Set

1. Go to `https://github.com/retailxai/retailxai-site/settings/secrets/actions`
2. Confirm `PRECIPICE_TOKEN` appears in the list
3. If it's missing, go back to Part C and create it

### Step 2: Trigger Test Run

1. **Navigate to Actions Tab:**
   - Go to `https://github.com/retailxai/retailxai-site`
   - Click the "Actions" tab at the top

2. **Select Update Data Workflow:**
   - In the left sidebar, click "Update Data"
   - You should see a list of previous workflow runs

3. **Run Workflow Manually:**
   - Click "Run workflow" dropdown button (top right)
   - Select branch: `main` (should be default)
   - Click green "Run workflow" button
   - A new workflow run will appear in the list

### Step 3: Monitor Workflow Execution

1. **Click on the New Run:**
   - Click on the workflow run that just started
   - You'll see it progress through steps

2. **Check Checkout Steps:**
   - Look for step: "Checkout repository" - should complete successfully
   - Look for step: "Checkout Precipice-2 repository" - **THIS IS THE CRITICAL STEP**
   - Look for step: "Verify Precipice-2 checkout" - should complete successfully

3. **Success Indicators:**
   - ✅ "Checkout Precipice-2 repository" completes without errors
   - ✅ "Verify Precipice-2 checkout" shows "Precipice-2 repository checked out successfully"
   - ✅ Workflow proceeds to "Copy draft files from Precipice-2"
   - ✅ Workflow completes all steps and shows green checkmark

4. **Failure Indicators:**
   - ❌ "Checkout Precipice-2 repository" fails with "Not Found"
   - ❌ "Verify Precipice-2 checkout" fails with directory not found error
   - ❌ Workflow stops before copy steps

### Step 4: Review Logs (If Failed)

If the workflow fails:

1. **Click on the Failed Step:**
   - Expand "Checkout Precipice-2 repository" or "Verify Precipice-2 checkout"
   - Look for error messages

2. **Common Error Messages:**
   - `"Not Found"` → Token doesn't have access (go back to Part B)
   - `"Bad credentials"` → Token is invalid or expired (go back to Part C)
   - `"Resource not accessible by integration"` → Token scopes insufficient (go back to Part A)

3. **Fix and Retry:**
   - Address the issue based on the error message
   - Update the secret if you regenerated the token
   - Run the workflow again

---

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| "Not Found" error | Token owner lacks repository access | Part B: Add account as collaborator |
| "Bad credentials" | Token invalid/expired | Part C: Generate new token, update secret |
| "Resource not accessible" | Token missing `repo` scope | Part A: Regenerate token with `repo` scope |
| Workflow succeeds but no files copied | Precipice-2 has no files in expected locations | Check Precipice-2 repository structure |
| Secret not found | Secret name mismatch | Part C: Ensure secret is exactly `PRECIPICE_TOKEN` |

---

## Security Best Practices

1. **Use Machine Account:** For production, consider creating a dedicated GitHub account (machine account) for automation
2. **Rotate Tokens:** Set token expiration and rotate regularly (every 90 days recommended)
3. **Minimal Permissions:** Only grant `repo` scope, avoid unnecessary permissions
4. **Monitor Usage:** Regularly check token usage in GitHub Settings → Personal access tokens
5. **Never Commit Tokens:** Never commit PATs to the repository - always use secrets

---

## Summary Checklist

Before running the workflow, verify:

- [ ] PAT created with `repo` scope (Part A)
- [ ] PAT owner account has Read access to `retailxai/Precipice-2` (Part B)
- [ ] `PRECIPICE_TOKEN` secret exists in `retailxai-site` repository (Part C)
- [ ] `curl` verification commands succeed (Part D)
- [ ] Test workflow run completes successfully (Part E)

Once all items are checked, the Update Data workflow should run successfully.

