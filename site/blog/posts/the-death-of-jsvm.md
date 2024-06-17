---
date: 20/06/2024
title: The death of JSVM
tags: jsvm, porffor
caption: and the rise of...
---

Today, I decided to kill off JSVM. It was a cool project definitely, but I think my time could be better spent in other places. That's what I'm talking about today! 

Recently, I've been contributing to a project called [Porffor](https://github.com/CanadaHonk/porffor). If you're not familar, Porffor is honestly a really awesome project, an entire AOT JS engine written in JS. It's basically what I was attempting to accompilish with JSVM, but instead of JVM bytecode it uses WASM. Before this, I had very little experience with WASM, but found it to be rather easy! There's a few strange things for sure (no `char`? 32 bit addressing?), but it all is very approachable. It's been rather fun so far, and I've made some pretty significant contributions! Some recent ones are a [hashmap implementation for maps](https://github.com/CanadaHonk/porffor/pull/76) and [array destructuring](https://github.com/CanadaHonk/porffor/pull/52). 

So, I've decided that I am going to make it as good as I possibly can, in order to fulfill my true desire: js that is as close to the hardware as it gets. I talked about it a little in the [JSVM blogpost](./about-jsvm/) but my goal eventually is to massively improve the performance of Javascript, as so much of it is so slow. I think it's awful that there are incredibly widespread pieces of technology that run javascript entirely unnecessarily, for example [Electron](https://www.electronjs.org/) and [React Native](https://reactnative.dev/). However, the reason that these technologies exist is a very valid one, developing good multiplatform native applications is hard, and there's already been so much work put into V8 and Blink, so why not leverage Chromium? Even though this line of reasoning makes sense, it does disregard the fact that most applications don't need much of this complexity, so my goal is to fix that! 

Au revoir! Have a great rest of your day :)
