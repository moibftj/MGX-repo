#!/usr/bin/env bash
set -euo pipefail

# Google Drive File Downloader
# This script downloads files from Google Drive links and adds them to the repository
# Usage: ./scripts/download_gdrive_files.sh <google-drive-url-or-file-id> [output-path]

GDRIVE_URL_OR_ID=${1:-}
OUTPUT_PATH=${2:-.}

function usage() {
  cat <<EOF
Usage: $0 <google-drive-url-or-file-id> [output-path]

Downloads files from Google Drive and saves them to the specified location.

Arguments:
  google-drive-url-or-file-id  Full Google Drive URL or just the file ID
  output-path                   Directory where file should be saved (default: current directory)

Examples:
  # Using full URL
  $0 "https://drive.google.com/file/d/11hTt8uK7sdA-RvwKRAU5w7O6Ebt2mVqT/view?usp=drivesdk" ./downloads

  # Using just the file ID
  $0 "11hTt8uK7sdA-RvwKRAU5w7O6Ebt2mVqT" ./downloads

Requirements:
  - Python 3 with pip
  - Internet connection
  - The Google Drive file must be publicly accessible or you must be logged in

This script will:
  1. Install gdown (Google Drive downloader) if not present
  2. Extract the file ID from the URL if needed
  3. Download the file to the specified directory
  4. Provide instructions for adding to git

EOF
}

if [[ -z "${GDRIVE_URL_OR_ID}" || "${GDRIVE_URL_OR_ID}" == "-h" || "${GDRIVE_URL_OR_ID}" == "--help" ]]; then
  usage
  exit 0
fi

# Extract file ID from various Google Drive URL formats
extract_file_id() {
  local input=$1
  
  # If it's already just an ID (alphanumeric), return it
  if [[ "${input}" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "${input}"
    return 0
  fi
  
  # Extract from various URL patterns
  if [[ "${input}" =~ /d/([a-zA-Z0-9_-]+) ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  elif [[ "${input}" =~ id=([a-zA-Z0-9_-]+) ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi
  
  # If we can't extract, return the input as-is
  echo "${input}"
}

FILE_ID=$(extract_file_id "${GDRIVE_URL_OR_ID}")

echo "Detected File ID: ${FILE_ID}"
echo "Output directory: ${OUTPUT_PATH}"
echo

# Check if gdown is installed
if ! command -v gdown &> /dev/null; then
  echo "gdown not found. Installing..."
  if ! pip install gdown; then
    echo "✗ Failed to install gdown. Please install it manually: pip install gdown"
    exit 1
  fi
  echo "✓ gdown installed successfully"
fi

# Create output directory if it doesn't exist
mkdir -p "${OUTPUT_PATH}"

# Convert to absolute path for safety
OUTPUT_PATH=$(cd "${OUTPUT_PATH}" && pwd)

# Download the file
echo "Downloading file from Google Drive..."
cd "${OUTPUT_PATH}"

if gdown "https://drive.google.com/uc?id=${FILE_ID}"; then
  echo
  echo "======================================"
  echo "✓ Download Complete"
  echo "======================================"
  echo
  echo "Files downloaded to: ${OUTPUT_PATH}"
  echo
  echo "To add these files to your git repository:"
  echo "  1. git add \"${OUTPUT_PATH}\""
  echo "  2. git commit -m 'Add files from Google Drive'"
  echo "  3. git push"
  echo
else
  echo
  echo "✗ Download failed. Possible reasons:"
  echo "  - The file is not publicly accessible"
  echo "  - The file ID is incorrect"
  echo "  - Network connectivity issues"
  echo "  - Google Drive rate limiting"
  echo
  echo "Please check:"
  echo "  1. File sharing settings (must be 'Anyone with the link')"
  echo "  2. File ID: ${FILE_ID}"
  echo "  3. Your internet connection"
  exit 1
fi

exit 0
