This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:


## Scripts

### secure_create_repo.sh
Creates a GitHub repository for the current project and pushes the current git history.

**Usage:**
```bash
./scripts/secure_create_repo.sh [repo-name]
```

The script prompts for your GitHub username and Personal Access Token (the token is not saved).

**Note:** Ensure your token has the `repo` scope to create and push repositories.

### download_gdrive_files.sh
Downloads files from Google Drive links and saves them to the repository.

**Usage:**
```bash
./scripts/download_gdrive_files.sh <google-drive-url-or-file-id> [output-path]
```

**Examples:**
```bash
# Using full URL
./scripts/download_gdrive_files.sh "https://drive.google.com/file/d/FILE_ID/view" ./downloads

# Using just the file ID
./scripts/download_gdrive_files.sh "FILE_ID" ./data
```

**Requirements:**
- Python 3 with pip
- Internet connection
- Google Drive file must be publicly accessible

For detailed instructions on uploading files from Google Drive, see [GDRIVE_UPLOAD_INSTRUCTIONS.md](./GDRIVE_UPLOAD_INSTRUCTIONS.md).

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
