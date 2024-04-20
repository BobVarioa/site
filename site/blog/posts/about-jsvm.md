---
date: 20/04/2024
title: About JSVM
tags: jsvm
caption: JS to JVM
---

#### Rationale
This project's purpose was two-fold. In the beginning it actually started off as a bit of a joke, "What if we turn Javascript into Java?" Me being who I am, I found the concept hilarious and decided to place it on my massive ideas list, one day to be chosen as how I spent my time. Yet when that day came and I rediscovered the project, I realized something else, that this project has significant application in the "real world". Much of modern day Javascript is annoyingly slow and horrendous on lower end hardware, and I figured it might actually be very practical for that application. I also knew however that it is a gargantuan task ([TC39's reference document](https://262.ecma-international.org/14.0/) is over a thousand pages long after all) to implement an entire Javascript engine, and decided to limit my scope, my first phase of the project (what I am presenting today) is not only a very limited subset of Javascript functionality, but also does not support many of its nuances and strange features. Essentially, this is a slightly more complex math engine, however I still believe this to be a valuable project, as I only spent two weeks of work on it. This limited scope included three major pillars that I would have to design: a BNF compiler compiler suite (much like lex and yacc, JavaCC, or the many derivative projects), a JVM classfile reader and writer, and the main "guts" of the compiler, an AST analyzer which produces the actual executable bytecode.

#### Journey
##### Step 1. BNF Grammar
My first major decision that I had to make was to choose how I was going to represent my grammar. There were lots of ways I could've represented this traditionally (`Rule :: token | OtherRule`), but I had a particular idea in mind. A couple years back I encountered a compiler compiler project by the name of [LangCC](https://github.com/jzimmerman/langcc/) which I quite liked the syntax of. I combined this with my own personal touch and a dash of Regular Expression syntax, and I was left with the following example, and began to implement its features.
```
tokens {
	skip -> \s+;
	skip -> "//" [^\n]+;

	id = [a-zA-Z_][a-zA-Z_0-9]*;
}

ast {
	file = (content: id*);
}
```
This mixed everything I liked about the two, and if you are familiar with compiler design this shouldn't look too out of place. I'm quite the sucker for aesthetics, and I believe this improved my productivity quite a bit. Using this design pattern, it was easy to create a central switch statement design that parsed the file into tokens. After some analysis, it generates a list of rules present in each segment of the file, free for other code to use. I had done this kind of manual compiler design before, so this was easy work for me. I barely ran into any challenges, most of my bugs were the typical off-by-one errors, not with my logic or design. However the next section was where this project became rather interesting.

##### Step 2. Interpret the grammar, Generate the AST
My hubris and ego inflated by my successes with the last section, and the oh so euphoric ticking off of the checklist, led me to think that this section would be more of the same, perhaps even I would be able to finish this entire project in a single day! This, however, did not end up being the case.

The tokenization was not too difficult and actually was quite similar to what I had created in the first section, but slightly more dynamically. For the sake of brevity, I will leave it at that because the AST is where I began to struggle.

I took a traditional recursive descent approach in the beginning, looping through each rule and recursing to each of its children until the file had no tokens left, or the next terminal failed to match any of the available rules. I, not much for initial research, did not consider left-recursion in the slightest, and just wrote a naive implementation, which then crashed and burned. After a bit of debugging I had realized the issue, and began to seek alternatives. If only, I thought, it could just recognize patterns in the tokens, if only it could find "expression"-shaped sequences, if only it could see what the next token was, if only it could look ahead. That is when inspiration struck, I figured that look-ahead would be able to detect whenever I was in these endlessly looping circumstances, and in fact I was correct, however with my current design, I couldn't figure out how to implement this in any efficient way, because I would have to build very large look-ahead tables to see the potential next terminal token. I would later learn this is what many recursive descent parsers which support left-recursion do, but I did not end up choosing this approach.

This is where in my journey I began to look how others had solved this problem, and after a bit of googling, I came across the Wikipedia page for [Shift-Reduce parsers](https://en.wikipedia.org/wiki/Shift-reduce_parser) and this made something click in my mind. I only had to store what my last successful parse captured, and backtrack whenever I failed. This lined up with my idea to find "expression"-shaped sequences because essentially that is what this does. After a bit of reorganizing my BNF rules to be the simplest to the most complex, (numbers -> addition instead of the previous addition -> numbers) and adding a bit of state to my parser, it now successfully passed my tests, and respected order of operations as necessary.

After this, I then moved on to bytecode generation, but I'd like to break the current chronological flow of this writeup to describe a problem with this approach that I would encounter later. This backtracking approach failed to consider rule specific state, and that began to break as my code became more complex. I thought a lot about how to fix this problem, trying at first a stack based rule state system to attempt to keep track of the last terminal token parsed. Eventually I decided that whenever I would encounter recursive rules, I just had to be more proactive with my capture of the tokens. I believe this is demonstrated quite well with an example:

Consider the following grammar.
```
Stmt = Decl ";" | Expr ";";
Decl = "var" id "=" Expr;
Expr = number | Expr "+" Expr;
```
With my previous design, the input text `var a = 1 + 1;` fails, this was deeply confusing to me, but with debugging I realized my error. As the parser begins to venture out of `Decl`, thinking that it has finished parsing the expression, but in fact does not encounter a semicolon, instead seeing a `+`. It chooses to backtrack, but then starts from the very beginning of the `Decl`, looking for a `var` token, thus failing to parse the input text.  I fixed this by greedily reparsing the `Expr` continuously until it failed keeping only the last successful result. For example, `Expr(1)` into `Expr(1 + 1)` then failure, which captures `Expr(1 + 1)` only now deciding that it has finished.

#### Step 3. Turn the AST to an Executable
##### A. JVM Classfile Library
This mini-step of the process was rather smooth, after some googling I had found the [JVM specification](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html) which guided me through all of the structures that would be necessary to parse and generate a classfile. For those unfamiliar with the JVM, a classfile is a binary format that describes a Java class, it contains the bytecode for each method, describes the fields present on the class, and lists all other relevant metadata for the class. This reminded me a lot of my experience with networking and Google Protocol Buffers, because of the binary aspects and serialization techniques. This, for me, was just something that was a time investment but not that difficult. Though, off-by-one errors- mainly writing shorts instead of bytes or vice-versa -plagued me throughout this process and were quite a chore to debug.

##### B. Generate an intermediary representation, and run Hello World.
Then came the key glue of this project, and what would combine all these elements together. I recursed down the ast, and generated a minimal set of typed instructions which described the code itself. For the sake of this first phase of the project, I choose to make the assumption that all variables would keep their initial type and would never leave scope. My simplistic typechecker came to completion, and after a final pass and a bit of reverse engineering of how `javac` represented certain concepts, I had finished! I ran my Hello World, and my goal was accomplished.

