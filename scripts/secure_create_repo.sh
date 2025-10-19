#!/usr/bin/env bash
set -euo pipefail

# Safer GitHub repository creation + push script
# - avoids embedding token in git config
# - uses HTTPS API with provided token for repo creation
# - supports existing repos and both master/main branches
# - cleans up sensitive variables on exit

REPO_NAME=${1:-MGX-repo}

function usage() {
  cat <<EOF
Usage: $0 [repo-name]

This will create a repository named by REPO_NAME (default: ${REPO_NAME}) under the authenticated user
and push the current git repository contents. You will be prompted for your GitHub username and a
Personal Access Token. The token will not be written to disk nor persisted in remote URLs.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

read -rp "GitHub username: " GITHUB_USERNAME

# Read token without echo
read -rsp "GitHub Personal Access Token (will not be saved): " GITHUB_TOKEN
echo

trap 'unset GITHUB_TOKEN' EXIT

echo "Creating repository '${REPO_NAME}' on GitHub..."

RESP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "$(printf '{"name":"%s","private":false,"description":"MGX Legal Letter AI Setup Guide","has_issues":true,"has_projects":true,"has_wiki":true}' "${REPO_NAME}")")

if [[ "${RESP_CODE}" == "201" ]]; then
  echo "✓ Repository created"
elif [[ "${RESP_CODE}" == "422" ]]; then
  echo "! Repository already exists — continuing"
else
  echo "✗ Failed to create repository (HTTP ${RESP_CODE}). Ensure token has 'repo' scope."
  exit 1
fi

# Determine remote URL temporarily embedding token for push only
TEMP_REMOTE="https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "Configuring temporary remote for upload..."
git remote remove origin 2>/dev/null || true
git remote add origin "${TEMP_REMOTE}"

echo "Staging and committing..."
git add -A
git commit -m "Initial commit: ${REPO_NAME}" || echo "No changes to commit"

# Try pushing existing branch (master -> main fallback)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD || echo "main")

push_branch() {
  local branch=$1
  if git push -u origin "${branch}" 2>/dev/null; then
    echo "✓ Successfully pushed to ${branch}"
    return 0
  fi
  return 1
}

echo "Uploading to GitHub..."
if ! push_branch "${CURRENT_BRANCH}"; then
  echo "Trying 'main' branch..."
  git branch -M main
  if ! push_branch main; then
    echo "✗ Push failed. Please check repository permissions and remote settings."
    # cleanup remote URL before exiting
    git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git" || true
    exit 1
  fi
fi

# Replace remote to remove token
git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo
echo "======================================"
echo "✓ Setup Complete"
echo "Repository: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo "======================================"

exit 0
