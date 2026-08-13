# Badge Flow Update

## Previous Flow (localStorage approach)
1. User uploads photo + fills form
2. Badge generated locally (canvas)
3. Badge stored as data URL in component state
4. On share click → upload to backend → get URL → share on X

**Problem:** Badge wasn't persistent, had to re-upload every time

---

## New Flow (Backend-first approach)
1. User uploads photo + fills form
2. Badge generated locally (canvas)
3. **Badge immediately uploaded to backend** (Vercel Blob or freeimage.host)
4. Badge URL + ID stored in state
5. Share on X uses the already-uploaded badge URL (no re-upload)

**Benefits:**
- ✅ No localStorage quota issues
- ✅ Badge persists in cloud storage
- ✅ Faster sharing (no re-upload)
- ✅ Production-ready with automatic Vercel Blob integration
- ✅ Automatic fallback to freeimage.host if Blob not configured

---

## Files Modified

### `src/app/page.tsx`
- Added `BadgeData` interface (url, id, storage)
- Changed `frameUrl` state → `badgeData` state
- Added `uploading` and `uploadError` states
- `handleGenerate` now uploads to `/api/upload` immediately after canvas generation
- Added loading UI while uploading
- Added error UI if upload fails
- Pass `badgeUrl`, `badgeId`, `storage` to `FramePreview`

### `src/components/FramePreview.tsx`
- Updated props: `imageUrl` → `badgeUrl`, added `badgeId`, `storage`
- Removed upload logic from `handleShare` (badge already uploaded)
- Removed `uploading` state and `cachedUrl` state
- Share button now instantly opens X with the share URL
- Download button works with external URLs (opens in new tab)
- Updated help text to reflect cloud storage

---

## Environment Variables

No changes needed! Works out of the box:

```bash
# Optional - for production performance
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx

# Not needed - origin detected dynamically from request headers
```

---

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo
2. Deploy
3. **(Optional)** Add Vercel Blob store named "hh-goa-badges" for faster uploads
4. If no Blob configured, automatically falls back to freeimage.host

### Other Platforms
Works immediately with freeimage.host fallback. No configuration needed.

---

## Testing Checklist

- [ ] Upload photo → form fills → generate badge → see "UPLOADING TO CLOUD" message
- [ ] Badge appears after upload completes
- [ ] Download button works
- [ ] Share on X opens Twitter with preview URL
- [ ] "Create Another Badge" button resets form
- [ ] Error handling: if upload fails, shows error message + retry button
- [ ] Works without BLOB_READ_WRITE_TOKEN (freeimage.host fallback)
