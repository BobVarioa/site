---
date: 22/03/2024
title: Building my own low-javascript website
tags: projects, low-javascript, web design
caption: Suprisingly fun!
---

Hi! My first real post, and I'll be talking about how I made this site itself! 

Why make a low-javascript site in the first place? I mean, most if not all people can run javascript nowadays, so why try to limit yourself to just standard css and html? Well, I'll tell you why I did it at least, javascript is *slow*. Look that's not to say that javascript is [evil](https://dev.to/amitkhonde/eval-is-evil-why-we-should-not-use-eval-in-javascript-1lbh) and [horrible](https://jsfuck.com/) or anything of that nature, but I constantly am annoyed when pages take an eternity to load and make a whole bunch of web requests just to load some blog or something. So, with that motivation (plus a curiousity to find out how people do this in the first place), I set out to build a (mostly) javascript-free website. 

Firstly, I had to decide what to even write the site in itself. I thought about doing pure html and css all inline, but that sounded like a pain to organize and keep straight, so I decided on a homebrew markdown and html template solution. [PostHTML](https://github.com/posthtml/posthtml) was my transformation tool of choice, and I built and found a series of plugins to aid me with making this site. 

Unfortunately, though, posthtml *sucks*. It took me lots of finagling to get my html to parse, all to resulting in the conclusion that I needed to set the parser's `xmlMode` to true (one would think an html parser would parse html correctly without that, but that's life I guess). After that, it was honestly incredibly easy. `markdown-it` to parse the markdown, `esbuild` to build my js and css, and a buildscript to tie it all together!

I added a few cool things too, like a no javascript theme changer (updates based on system preferences), ipa pronunciation guides, and an automatic post rss-feed. Now, its time for me to, y'know, actually write these posts, by far the hardest part ;P. 

See ya! 