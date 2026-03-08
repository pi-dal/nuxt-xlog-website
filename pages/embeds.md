---
title: Embedded Components
slug: embeds
type: page
description: Reusable Markdown embeds for links, code snippets, videos, and repository callouts.
display: Embed Components
---

This page is the first pass at bringing the `antfu.me` embedding workflow into this site: keep the page itself in Markdown, then drop in small Vue components only when the content actually benefits from richer presentation.

## AppLink

Use `AppLink` for links that might be internal or external. Internal links stay on the router, external links open in a new tab.

<div class="flex flex-wrap gap-3 my-4">
  <AppLink to="/posts" class="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1.5 text-sm no-underline transition hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-400">
    Browse posts
  </AppLink>
  <AppLink to="https://github.com/antfu/antfu.me" class="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1.5 text-sm no-underline transition hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-400">
    Reference source
  </AppLink>
</div>

## TextCopy

`TextCopy` is useful for shell commands, package names, route paths, handles, or any small chunk of text that readers are likely to reuse.

<TextCopy>pnpm add @vueuse/core</TextCopy>

<TextCopy text="https://pi-dal.com/embeds" />

## GitHubRepoCard

For projects, tools, and references, a repo card carries more weight than a plain inline link.

<GitHubRepoCard
  repo="antfu/antfu.me"
  title="antfu.me"
  description="Anthony Fu's personal website, built around Markdown content plus embedded Vue components."
  badge="Reference"
/>

<GitHubRepoCard
  repo="pi-dal/nuxt-xlog-website"
  title="nuxt-xlog-website"
  description="This site. A Vite + Vue 3 + vite-ssg stack that is now getting a reusable embeds layer."
  badge="Current"
/>

## YouTubeEmbed

When the article needs a real video instead of a plain link, embed it directly and keep the surrounding prose short.

<YouTubeEmbed id="aqz-KE-bpKQ" />

## BilibiliEmbed

The same pattern applies to Bilibili so Chinese-language content can stay first-class instead of being pushed out to a plain hyperlink.

<BilibiliEmbed bvid="BV1xx411c7mD" />

## Why This Matters

This is the pattern worth learning from `antfu.me`:

- Markdown remains the default authoring surface.
- Components are small, focused, and content-driven.
- Rich embeds stay reusable instead of being rewritten per post.
- Heavier interactive demos can come later, once the lightweight embed layer is solid.
