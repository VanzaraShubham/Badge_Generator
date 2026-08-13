# Vercel Blob Storage Setup

## What Changed:
✅ Installed `@vercel/blob` package
✅ Updated `/api/upload` to use Vercel Blob instead of freeimage.host
✅ Updated `/api/og` to fetch from Vercel Blob using badge ID
✅ Updated share page to support ID-based URLs
✅ Updated frontend to use ID-based share flow

## Next Steps:

### 1. Create Vercel Blob Storage (on Vercel Dashboard)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Storage** tab
4. Click **Create Database** → Select **Blob**
5. Name it: `hh-goa-badges`
6. Click **Create**

Vercel will automatically inject `BLOB_READ_WRITE_TOKEN` environment variable into your deployment.

### 2. Deploy to Vercel

```bash
git add .
git commit -m "feat: migrate to Vercel Blob storage for faster badge sharing"
git push origin main
```

Vercel will auto-deploy.

### 3. Test the Flow

1. Generate a badge on the live site
2. Click "Share on X"
3. Badge uploads to Vercel Blob (fast!)
4. Share URL will be: `https://hh-goa-badge.vercel.app/share?id=badge-123456-abc`
5. X's bot crawls the page and sees OG image at: `/api/og?id=badge-123456-abc`
6. OG image fetches from your own Vercel Blob storage
7. ✅ Badge appears in X preview card!

## Benefits:

- ⚡ **Much faster** - no third-party API delays
- 🔒 **Reliable** - your own infrastructure on Vercel CDN
- 🆓 **Free tier** - 500GB bandwidth/month (more than enough)
- 🌍 **Global CDN** - badge images served from nearest edge location
- ✅ **Better X integration** - OG images work perfectly

## Troubleshooting:

If uploads fail with "BLOB_READ_WRITE_TOKEN not found":
- Make sure you created the Blob store in Vercel dashboard
- Redeploy after creating the storage
- Check Environment Variables in project settings

For local development:
- Copy the `BLOB_READ_WRITE_TOKEN` from Vercel dashboard
- Add it to `.env.local`
- Restart dev server
