---
date: 22/04/2024
title: About Nativ
tags: nativ
caption: Video is kinda hard guys
---

Nativ is one of my favorite projects I've ever dreamed up. Nativ originally came about whenever I wanted to create a video player for Youtube that used less resources than a chrome tab. Seems simple right? I thought so as well, and figured it couldn't be too hard to extract the video stream from Youtube, so after trying to string together a very hacky solution using vlc and youtube-dl, I got a lua plugin that sort of worked. The problem with this however was that it missed so many features that I really wanted. The video streams expired after a couple hours, I lost pretty essential information like information cards and endcards, and not to mention I didn't get any recomended videos either! Regardless, it was a very hacky solution that broke all the time, so even if it didn't have these features I wanted, I wanted a different solution. 

This led me to seek a different solution, but finding what I wanted was no easy task. First, I needed something that could interface with Innertube, the internal api that the website itself uses. Secondly, I needed something that could render natively (nativ-ly, \*wink*) to a system window-- no electron, no python garbage, etc. And lastly, I'd prefer if the technologies were all something I already knew. 

This, realistically, left me with two options. The first one was to rewrite a library I had found into C++, `youtubei.js`, but it was highly polymorphic and used a lot of features specific to Javascript, in short it was going to take a while to port over anything that was at any level of functionality. But throughout this part of my research I found something very promising, `node-gtk`! A node binding for gtk and related libraries, it seemed perfect, and while it was a headache it ended up working very well for what I wanted. 

After getting a simple media player running with GStreamer (using `libvlc` would probably been even more of a struggle), it was trivial to just fetch the information I needed to stream the video. It still has some issues in regards to seeking through the stream, but overall, it worked very well. More features are to come, but it uses barely any resources, and that was the main goal. Eventually, I want to completely recreate Youtube, but that's for another day.
