# abhaytewari.com

Personal site of Abhay Tewari: articles, stories, courses and interactive tools
(Gift Re Pricing Lab, Cycle Compass). Built with [Astro](https://astro.build);
all content is Markdown; no database, no server.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321, live reload
npm run build      # static site -> dist/
npm run preview    # serve dist/ locally
```

Node 20 or newer.

## Publish a new article, story, course or lesson

Everything lives in `src/content/`. Add a Markdown file; the site rebuilds it into a page.

**Article** — `src/content/blog/my-new-post.md` → `/blog/my-new-post/`

```markdown
---
title: "Title of the piece"
description: "One or two sentences shown on cards, in search results and in RSS."
date: 2026-10-01
tags: [reinsurance, investing]
readingTime: "8 min read"     # optional
draft: false                  # true hides it from the build
---
Body in Markdown. Maths works: $\xi > 0$ inline, or $$ ... $$ on its own lines.
```

**Story or essay** — `src/content/stories/name.md`, frontmatter `title`, `description`, `date`, `kind: story | essay | poem`.

**Course** — `src/content/courses/course-slug.md` with `title`, `description`, `level`, `duration`,
`status: open | coming-soon | closed`, `audience`, optional `price` and `enrolUrl`, and a `modules`
list of `{ title, lessons: [...] }`. The body is the course introduction.

**Lesson** — `src/content/lessons/lesson-slug.md` with `title` (must match the lesson name listed in the
course's `modules`), `course: course-slug`, `order: 1`. Lessons appear at `/courses/<course>/<lesson>/`
with previous/next navigation.

Commit and push; the host rebuilds the site in about a minute.

## Deploy (free) and connect abhaytewari.com

1. Put this folder in a GitHub repository (`git init`, commit, push).
2. On [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com), choose "Import project", pick the
   repository. Both detect Astro automatically (build `npm run build`, output `dist`). Every push to `main`
   deploys; pull requests get preview URLs.
3. Buy `abhaytewari.com` (GoDaddy, Namecheap, Cloudflare Registrar, Hostinger all work; about ₹1,000–1,500 a year).
4. In the host's dashboard add the domain; it shows two DNS records (an `A` or `ALIAS` record for the root and a
   `CNAME` for `www`). Enter them at the registrar. HTTPS is issued automatically within an hour.
5. `astro.config.mjs` already has `site: 'https://abhaytewari.com'`, which the sitemap, RSS and canonical
   URLs use. Change it if you choose a different domain.

GitHub Pages also works (`npx astro add github` or a standard Actions workflow), but Vercel/Netlify need
no configuration.

## The tools

* `public/apps/pricing-lab/index.html` — the Gift Re Pricing Lab, a single self-contained file built from the
  `giftre` research repository (`python web/build.py` there, then wrap as a full HTML document). Replace this
  file to update the model; the site page `/tools/pricing-lab/` embeds it.
* `src/pages/tools/cycle-compass.astro` — the Cycle Compass; signal definitions, weights, sector and ETF tables
  are plain JavaScript constants at the top of the script and can be edited directly. The "August 2026 read"
  preset is the `AUG26` object.

* `src/pages/tools/zenojas.astro` + `public/apps/zenojas/outputs.json` — the ZENOJAS Stock Model page reads the JSON at
  load time. To publish a new quarter, re-run the model offline (the handoff note in the Claude project describes the
  JSON layout), replace `outputs.json` and, if the model changed, `src/data/zenojas-model-card.md`. Nothing else changes.

To add a tool: build it as a static HTML app under `public/apps/<name>/`, add a wrapper page under
`src/pages/tools/<name>.astro` (copy `pricing-lab.astro`) and a card in `src/pages/tools/index.astro`.

## Later additions, when you want them

* **Comments / newsletter**: Giscus (GitHub-backed comments) or Buttondown / Substack embed; both are a script tag in `Base.astro`.
* **Paid courses**: keep the course pages here; sell through Razorpay Pages, Gumroad or Teachable and set `enrolUrl` in the course frontmatter.
* **Analytics**: Plausible or Umami (privacy-friendly, one script tag).
* **Search**: Pagefind (`npx pagefind --site dist` after build) adds static search with no backend.

## Layout

```
src/content/{blog,stories,courses,lessons}/   Markdown content
src/pages/                                     routes (index, about, blog, stories, courses, tools, rss)
src/layouts/Base.astro                          header, nav, footer, theme toggle, fonts
src/styles/global.css                           design tokens (light/dark), typography, components
public/apps/pricing-lab/                        the pricing tool (standalone)
public/vendor/                                  KaTeX for maths
```
