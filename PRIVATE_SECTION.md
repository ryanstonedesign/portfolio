# Private Section

How the password-protected Private section keeps its images and videos safe, how to add files to it, and what anyone can or can't see.

## In short

- The original files stay only on your computer.
- Only scrambled (encrypted) copies are published, and they're useless without the password.
- Videos of any size stream and start playing right away, with no compression needed.

## Why it works this way

This repo is public, and so is the R2 bucket that hosts the public videos. Anything uploaded the same way as the public images or videos can be downloaded by anyone, password or not. So private files are never uploaded as they are. Each one is encrypted first, and only the encrypted copy goes online.

## Where private files live

| What | Where | Public? |
| --- | --- | --- |
| Original images and videos | `private/media/` on your computer | No. The folder is gitignored and never reaches GitHub. |
| Project list (filenames, order) | `private/projects.json` on your computer | No. Also gitignored. |
| Password | `.env.local` on your computer | No. Gitignored. |
| Encrypted copies (random `.bin` names) | The `p` folder in R2, or `public/private-media/` for small files | Yes, but they're unreadable without the password. |
| Locked project list | `src/data/private.enc.json` | Yes, but it's unreadable without the password. |

## Adding private files

1. Put the originals in `private/media/`, named like the public ones (e.g. `ux_dev_secretProject_2026.mp4`).
2. List them in display order in `private/projects.json`:

   ```json
   {
     "blobBaseUrl": "https://pub-5ffdb96dde9f461f9964cb58f3746161.r2.dev/p",
     "files": [
       "ux_dev_secretProject_2026.mp4",
       "photo_secretShot_2026.jpg",
       { "filename": "brand_comingSoon_2026.jpg", "placeholder": true }
     ]
   }
   ```

   - `blobBaseUrl` sends the encrypted copies to R2. You need it for any file over about 95 MB, which GitHub rejects. Leave it out to commit small encrypted files to the repo instead.
   - `"placeholder": true` shows a gray card until the real file exists.
3. Make sure `.env.local` contains `PRIVATE_PASSWORD=...` (see [Password](#password)).
4. Run `npm run encrypt-private`.
5. Upload everything in `private/upload/` to the `p` folder in R2. Delete the old files there first, because every run gives the files new random names.
6. Commit and push `src/data/private.enc.json`, plus `public/private-media/` if you aren't using R2.

## One-time R2 setup (CORS)

The page fetches the encrypted files with code so it can unscramble them, and browsers block that unless the bucket allows the site. In Cloudflare, open R2, pick the bucket, go to **Settings**, then **CORS Policy**, and paste:

```json
[
  {
    "AllowedOrigins": ["https://www.ryanstonedesign.com", "http://localhost:5173"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"]
  }
]
```

Without this, the section unlocks but private videos won't load.

## Password

- It must be at least 16 characters; the encrypt command refuses anything shorter.
- A string of 4–5 random words is ideal, e.g. `maple-rocket-tundra-violin-sock`.
- Why length matters: anyone can download the locked list file and try millions of guessed passwords on their own computer, with no limit on attempts. A long, random password puts that out of reach.

## What people can see

**In the public repo or bucket, without the password:**
- `.bin` files with random names. Nobody can tell what they show, what project they belong to, or whether they're photos or videos.
- `private.enc.json`, which looks like random letters and numbers.
- The code that does the locking. That's normal; showing how a lock works doesn't open it.
- The only leak: how many private files there are and roughly how big each one is.

**With the password:**
- Everything in the Private section, the same way you see it.
- They can save images or record video. No website can prevent that once someone is allowed to view something.
- They can share the password. If that happens, set a new one and re-run the encrypt command (see the next section).

## Changing the password

1. Update `PRIVATE_PASSWORD` in `.env.local`.
2. Run `npm run encrypt-private`.
3. Replace the files in R2 and commit.

Old encrypted versions stay in git history and can still be unlocked with the old password, as can any old files left in R2. If a password leaks, treat whatever was published under it as exposed.

## How it works (technical)

- **Encryption** (`scripts/encrypt-private.mjs`): each file gets its own random AES-256-GCM key and is encrypted in 1 MB chunks under a random filename. Each chunk's IV is an 8-byte random prefix plus a 4-byte chunk index. The per-file keys, filenames and blob locations go into a manifest, which is encrypted with a key derived from the password (PBKDF2-SHA256, 600,000 iterations). Files are read and written one chunk at a time, so their size isn't limited by memory.
- **Streaming** (`public/private-sw.js`): a service worker answers requests to `/__private-media/<id>`. It fetches only the encrypted chunks the player asks for (HTTP Range requests) and decrypts them on the fly, so videos start right away and can seek. The worker stores no keys: for each request it asks the page that made it, and the page only has keys while the section is unlocked. Decrypted data is sent with `Cache-Control: no-store`.
- **Page** (`src/pages/Private.jsx`, `src/utils/privateMedia.js`): after the password unlocks the manifest, the page hands out keys to the worker on request and forgets them when you leave the section. The page only accepts encrypted files or inline placeholders, so a plain public link can't slip in.
- **Fallback:** if a browser blocks service workers (some private-browsing modes), the page downloads and decrypts whole files instead. That's just as secure, but large videos take longer to start and may struggle on phones.

### Safety checks in the encrypt command

- Refuses passwords under 16 characters.
- Refuses to run if a private file also exists in `public/` or `src/content/`.
- Rejects the old `mediaBaseUrl` setting, which pointed at unencrypted files.
- Clears out old encrypted files on every run, so removed files stop being published.
- Refuses files too large for GitHub unless `blobBaseUrl` is set.

## Testing done

Tested in Chrome against a production build, using a 98 MB video from this repo hosted on a test server set up like R2:

| Check | Result |
| --- | --- |
| Section ready after unlocking | About 0.2 s |
| Full-resolution video starts playing | About 0.65 s |
| Skip to near the end | About 0.75 s |
| Unscrambled video vs. original | Byte-for-byte identical |
| Wrong password | Error shown, nothing downloaded |
| After leaving the section, or from a tab that was never unlocked | Files refused |
| Service workers blocked | Falls back to whole-file download, still plays |

Not yet tested: Safari on iPhone, and the real R2 bucket. Check both after the first real upload.
