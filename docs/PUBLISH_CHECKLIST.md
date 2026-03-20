# Publish checklist (before Gumroad / Lemon Squeezy)

Use this once the repo is ready to sell.

## Product page

- [ ] Replace **Gumroad** product URL in `README.md` and `public/landing.html` (search `storyos-template`).
- [ ] Add **Lemon Squeezy** checkout URL if you sell there too (same files + README hero line).
- [ ] Replace **Discord** links (`discord.gg`) with your invite.
- [ ] Set your **price** on the landing page and the marketplace.
- [ ] Swap **placeholder screenshots** in `public/marketing/*.svg` for real **PNG/WebP** (keep filenames or update paths in README + `landing.html`).

## Repo hygiene

- [ ] Confirm **`.env` is gitignored** and never committed.
- [ ] Run **`npm run ci`** (exactly that — no extra words after `ci`, or Vite mis-parses the build).
- [ ] Optional: tag a release `v1.0.0` and attach a zip for buyers.

## Legal

- [ ] Review **`LICENSE`** with a lawyer if you need jurisdiction-specific terms.
- [ ] On the product page, state: personal + commercial use OK; **no resale of source as another template** (matches `LICENSE`).

## After first sale

- [ ] Add buyers to **Discord** or email list if you offer support.
- [ ] Keep **`SETUP_GUIDE.md`** updated if install steps change.
