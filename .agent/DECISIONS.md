# DECISIONS — Late Apex site

> **Responsibility:** why things are the way they are.
> Append-only. Each entry records a choice and the reasoning behind it, so a
> future session does not relitigate a settled question or silently reverse it.
>
> Written by `loop note "<what>" --decision --why "<reasoning>"`.

Record a decision when:

- two reasonable implementations were possible and one was chosen
- a constraint was discovered that changes the plan
- something was deliberately *not* done
- an assumption was made in the absence of an answer

---

## 2026-09-16 15:36

**Project initialised.**

Initial plan not yet written.

## 2026-09-16 15:36

**Studio renamed to Late Apex**

Racing term for the line that gives the fastest exit; fits the night-drift footage and a studio promising fast launches. Owner asked for a better name and to be creative; easy to change later (one token in chrome.js/footer.js + logo).

## 2026-09-16 15:36

**site/frames and source videos are git-ignored**

281MB+ of generated WebP frames; regenerate with .work/ingest2.sh + manifest.mjs. Owner to decide on Git LFS or storage before deploy.

## 2026-09-16 16:07

**Shot cuts use a fade-out → anamorphic headlight flare → fade-in instead of a crossfade; frames are 2x motion-interpolated (ffmpeg minterpolate) and neighbouring frames blend by the scroll fraction.**

Owner said the old crossfade looked like a bad double exposure and scrubbing felt like slides; blur filter per frame also cost frame time.
