---
title: An Honest Critique of Svelte 5
description: Svelte 5 is a great, but it's not perfect.
pubDatetime: 2024-12-18
modDatetime: 2024-12-18
thumbnail:
  imagePath: "https://raw.githubusercontent.com/AmeerArsala/ameer-webdata/refs/heads/main/svelte-logo.png"
tags: ["WEB DEVELOPMENT", "DX", "JAVASCRIPT"]
draft: true
---

# An Honest Critique of Svelte 5

With the release of Svelte 5, the Svelte team has made a number of improvements to the framework. These improvements have been made to improve the developer experience, performance, and usability of Svelte as a framework. Out of the UI frameworks, Svelte is my favorite, and in my opinion, this update made it even better to the point where I can just always choose it over React, Vue, Solid, Angular, etc.

While they have improved Svelte in a number of ways *especially* when it comes to more complex applications, there are a few things that, in my eyes, could be much better. From a technical standpoint, you can now just *do* things that were difficult to do before, such as with fine-grained reactivity. However, with this new added functionality, there is a bit more complexity to the framework that I believe could be improved upon.

If you're still reading this, I'm assuming you are already familiar with Svelte and have a good grasp of Svelte 4, and perhaps are even thinking of switching to Svelte 5. Or maybe you're already using Svelte 5 and are just reading up on it. Because of this, I won't be going over all of the new features in Svelte 5 in detail, but I will be going over some of the things that I think could be improved upon.

## What made Svelte 4 so great in the first place?

Svelte 4 is awesome, but it's also not perfect. Svelte 4 is designed around the use-cases of "the 95%" and not the other 5%. As a result of this narrower focus, Svelte makes it extremely simple to write stuff that would take lots more code to do in other frameworks, making Svelte apps a lot easier & faster to build, maintain, debug, and scale than its competitors.

Here's a simple example of the same component in both Svelte 4 and React:

Svelte 4:

`Coordinates.svelte`

```svelte
<script>
  import { onMount } from "svelte";

  export let x = 0;
  export let y = 0;

  $: product = x * y;

  let count = -1;

  onMount(() => {
    count = 0;

    console.log("count: ", count);
    console.log("Mounted component");
  });
</script>

<p>The product of {x} and {y} is {product}</p>

<!-- This is a comment -->
<div>
  <h1>You clicked {count} times</h1>
  <button on:click={() => count++}>Click me</button>
</div>

<style>
	button {
		font-size: 2em;
	}
</style>
```

`App.svelte`

```svelte
<script>
  import Coordinates from "./Coordinates.svelte";
</script>

<Coordinates x={1} y={2} />
```

React:

`Coordinates.jsx`

```jsx
import { useState, useEffect } from "react";

export default function Coordinates(props) {
  const [x, setX] = useState(props.x);
  const [y, setY] = useState(props.y);
  const [product, setProduct] = useState(0);
  const [count, setCount] = useState(-1);

  useEffect(() => {
    setProduct(x * y);
  }, [x, y]);

  useEffect(() => {
    setCount(0);

    console.log("count: ", count);
    console.log("Mounted component");
  }, []);

  return (
    <>
      <p>The product of {x} and {y} is {x * y}</p>

      <div>
        <h1>You clicked {count} times</h1>
        <button onClick={() => setCount(count + 1)}>Click me</button>
      </div>
    </>
  );
}

// For styles, you need a separate CSS file 💀💀💀😭😂🤣🤡
```

`App.jsx`

```jsx
import Coordinates from "./Coordinates.jsx";

export function App() {
  return <Coordinates x={1} y={2} />;
}

export { App };
```

I bet the React one confused you a lot more than the Svelte one, even though it was a simple example. It took me a lot longer to even write that and I had to check for bugs after. Trust me, all of these quirks make the gap between the 2 frameworks much wider when you factor in TypeScript, have higher project complexity, more code to write, and more bugs to fix.

Over time, all these little things add up to Svelte being a **much** more productive framework to use.

**What makes Svelte 4 so great is how *simple* it is**.

**95% of the time.**

Once you get into doing some more complex projects with Svelte, you will find yourself missing some of the fine-grained benefits of JSX, such as modularity, fine-grained reactivity, shared state across components in a less complex way, and more.

This results in `*.svelte` files where the content of the `<script>` tag can be so long and complex that it's hard to figure out what's going on. Sometimes this can be mitigated by splitting the code into multiple files, but not only is that still a pain but it can also make things harder to read and debug. And you don't always even have that luxury! This results in Svelte 4 projects where while it is productive for the most part, it is somewhat janky in parts of the codebase, which could slow down productivity.

## Enter Svelte 5

The goal of Svelte 5 is to maintain the simplicity and productivity of Svelte 4 while no longer having the issues that Svelte 4 had that arose from abstracting away certain key information (in 5% of cases) from the developer.

Svelte 5 basically completely fixes the issues that Svelte 4 had with its new improvements. You essentially get almost all the simplicity of Svelte 4 with the added benefits of Svelte 5.

Here's the same example from above, but with Svelte 5:

`Coordinates.svelte`

```svelte
<script>
  import { onMount } from "svelte";

  let {
    x = 0,
    y = 0
  } = $props();

  let product = derived(x * y);

  let count = $state(-1);

  onMount(() => {
    count = 0;

    console.log("count: ", count);
    console.log("Mounted component");
  });
</script>

<p>The product of {x} and {y} is {product}</p>

<!-- This is a comment -->
<div>
  <h1>You clicked {count} times</h1>
  <button onclick={() => count++}>Click me</button>
</div>
```

`App.svelte`

```svelte
<script>
  import Coordinates from "./Coordinates.svelte";
</script>

<Coordinates x={1} y={2} />
```

As you can see, Svelte 5's <a href="https://svelte.dev/docs/svelte/what-are-runes" target="_blank">Runes</a> are in full display here, and they're not the only improvement Svelte 5 makes.

In my opinion, the key changes of Svelte 5 are:

- Runes
- Snippets (huge W for modularity)
- Event System is Deprecated & a move towards an FP approach to components (as it should be)
- Logic is no longer contained to svelte files

### Runes

<a href="https://svelte.dev/docs/svelte/what-are-runes" target="_blank">Runes</a> are a replacement for Svelte 4's tendency to hijack the syntax of JS/TS, and give Svelte a bunch of abstractions while still allowing for more fine-grained control over the framework itself so you don't run into the issues that Svelte 4 had.

As of writing this, the list of runes are:

- `$props`
- `$state`
- `$derived`
- `$effect` (it's better than React's `useEffect` I promise)
- `$bindable`
- `$inspect`
- `$host`

I'm not going to go over all of the runes, but I will say that they're actually really nice, and I like that they remain simple while not hiding anything key from the developer should they need to dive deeper.

### Snippets

Now you don't have to split your code into multiple files to make it more modular. I can literally just do:

```svelte
<script>
  // ...

  let {
    x = 0,
    y = 0
  } = $props();

  let product = derived(x * y);

  // ...
</script>

<!-- Define the snippet here -->
{#snippet OperationResult(operationName, a, b, resultValue)}
  <p>The {operationName} of {a} and {b} is {resultValue}</p>
{/snippet}

<!-- Now use it wherever you want -->
<!-- This will come out to: <p>The product of {x} and {y} is {product}</p> -->
{@render OperationResult("product", x, y, product)}

<!-- ...put the rest of the HTML-like code here -->
<div>
  <h1>Hello World</h1>
</div>
```

Pretty cool, right? I can now just have things be modular, making this a lot more convenient and maintainable to work with. Also, `children` is now a reserved word in the context of `{@render children()}` or `{@render children?.()}` as it now replaces the `<slot />` syntax. You can still use `<slot />` if you want to, but they say it will be deprecated in a future update. I actually have a few problems with this, but I'll get to that in a bit.

In fact, there is a pivot to the usage of a more clean system of these template directives (some new and some old) like so:

- `{#if ...}`
- `{#each ...}`
- `{#key ...}`
- `{#await ...}`
- `{#snippet ...}`
- `{@render ...}`
- `{@html ...}`
- `{@const ...}`
- `{@debug ...}`

While these are not all inherently new, Svelte 5 has pivoted to encourage using these a lot more by removing features that shifted the user's focus away from Svelte's core functionality.

### Deprecation of the Event System

You know the `on:` syntax for events and `createEventDispatcher()` for dispatching events? Well, that's all been deprecated in Svelte 5. For non-manually dispatched common events like `on:click`, it has been replaced with `onclick`.

Why?

Svelte 5 is all about making the framework more explicit and less magical, so why?

At first, I wasn't keen on this change, but I've come to realize that it's actually a good thing, as it is part of the movement to a more functional programming approach to components. Instead of dispatching events, you just call a function that you pass into the component. Simple as that.

Why not just keep it you ask? It reduces decision fatigue as there is a single way of doing things (given the same situation). As a developer, you make thousands if not millions of decisions in the Apps you build, and whether to pass in a function or do an event dispatch when you don't even need to do the event dispatches most of the time adds up to a lot of unnecessary decisions and a lot of wasted time.

Additionally, I believe that an event system should not be a part of the UI framework, but instead be a separate library that the developer chooses to use on their own.

### Logic is no longer contained to Svelte files

This one's brief but a very cool change that I'm sure people will love. You can now use Svelte's logic in files other than `*.svelte` files. They have to be `*.svelte.js`, `*.svelte.ts`, etc. but it allows you to use the new runes anywhere there so you could share state across svelte components. I'm a happy user of <a href="https://github.com/nanostores/nanostores" target="_blank">nanostores</a> since I use Astro (which is what this site uses btw), so I don't personally foresee myself having much use for this feature when I already use nanostores, but I think it's an awesome feature to have.

### Verdict?

With these new changes, Svelte 5 feels a lot less "all over the place" with bruh moments left and right, and more like an *instrument* to be played.

All in all, Svelte 5 fixes virtually all of the issues that Svelte 4 had, while still having almost all of the greatness of simplicity that Svelte 4 had.

**Almost.**

## Svelte 5's biggest problem

From a programmatic/coding/SWE standpoint, Svelte 5 is like the perfect improvement. It follows all the best constructs, everything is simple while also not abstracting away anything that the developer would want to know or use. It also flows into itself in a meaningful way, so it's not just a bunch of random features cobbled together.

However, from a **developer psychology** standpoint, Svelte 5 leaves a bit to be desired. The 2 areas I see this in are:

1. Some of the runes miss the point when it comes to what made Svelte 4 productive
2. It breaks its own philosophy for the changes to rendering children

### The Problem with Runes

Before I get into this, we first have to ask ourselves:

> Why Runes? What was the point of introducing runes, not even compared to Svelte 4, but as a standalone feature?

The point of runes are to provide a bunch of magic white box abstractions that do things you'd want in these frameworks while still maintaining a syntax that is consistent with JavaScript, so that Svelte's compiler can compile it to raw JS.

Again, from a programmatic/SWE standpoint, this sounds perfect. Best of all worlds, right?

**No.**

Let me recontextualize the question a bit.

From the compiler's perspective, these runes are like that because the compiler treats them all as runes to compile into raw JS while still appearing as valid JS by itself. **They all serve the same purpose to the compiler**.
From the developer's perspective, **the runes all serve different puposes**, as the developer will make them be used in different ways.

They are given a consistent and recognizable identity with `$<rune name>`, which draws attention to the fact that they are runes.

> Why is most of the emphasis put on the fact that they ARE runes and not their actual purposes, functionalities, and relationships to each other, subtly indicating on how they could be used with one another?

What do I mean by this? The developer is not a compiler, they are a human, which means they have a human brain.

**It is a well-known fact that the human brain processes images and symbols thousands of times faster than words.**

So when you have a syntax like `$<rune name>`, it is drawing more attention to the fact that it IS a rune and not what the rune actually DOES. Of course, when the developer reads/thinks of `<rune name>`, they have to mentally think of its actual purpose, causing a slight cognitive load rather than immediately just *knowing* what it does and how to use it from the moment it enters their view (within the first miliseconds, and yes this does matter).

I believe it was a mistake for this design decision to be made. People who disagree with this take will likely point to how the consistency of the design is necessary for the 'white box' philosophy of Svelte 5 so you know where the magic is and what is happening, as well as making it easier on the compiler and still having full compatibility with JS, but I'm not satisfied with just "great" or "amazing". I got the hots for "exceptional". I believe all those conditions and a solution to the problem outlined above are not mutually exclusive. Here's my solution:

- Runes will still be prefixed with `$` and will be valid JS, but not all runes will visually look the same
- `$props`, `$bindable`, `$inspect`, and `$host` will stay exactly the same, as I believe they all serve a consistent group of identities as magic functions
- `let x = $state(0);` becomes just `let x = $(0);`
- `let product = $derived(x * y);` becomes just `let product = $$(x * y);`
- `$effect(() => { ... });` becomes just `$$(() => { ... });`
  - Naturally, `$effect.pre()` becomes `$$.pre()`
  - Naturally, `$effect.tracking()` becomes `$$.tracking()`
  - Naturally, `$effect.root()` becomes `$$.root()`

Here's my reasoning for this:

**Lack of changes to `$props`, `$bindable`, `$inspect`, and `$host`**

Did this to make the other changes stand out to the developer's sensory/muscle memory. I also think they are all fine representations of what they actually are.

**`$state()` -> `$()`**

When a developer/user declares reactive state, there is a fundamentally different way they think about it than the other runes. They want **variables**. They aren't really concerned with the underlying implementation of how it has reactivity, they just want to be able to use it as a variable and have it be reactive. However, they should still know what is and isn't reactive, but the *emphasis* on what it is as they type it should be placed more on the variable itself, **not the fact that it is reactive being shoved in their face**. The meaning of the declaration should NOT be diluted by the fact that it's a reactive being shoved all over the developer's face.

I completely understand if you think this is a nitpick, but this is getting into the realm of cognitive science.

Also, for how common the use of reactive state is in these components, `state` is a mouthful.

Imagine a beautiful world where you can just type `let x = $(0);` and have it be reactive.

**Changes to `$derived` and `$effect`**

If `$` implies a regular rune, then `$$` should imply a rune that takes into account other runes. A 'rune of runes', if you will. Or you could just call it a rune that implies dependencies / causes and effects.

This is very consistent with the actual behavior of these runes, and a developer won't have to just learn that "oh these 2 runes are related" in order to know how to use them better; no, they just *are* related.

The human brain will instantly recognize that `$$` is for *dependencies* without having to read a whole word and it is instantly clear. As an added bonus, it's also less of a handful to type and is also focused on what the rune actually DOES rather than drawing attention to the fact that it IS a rune.

### The Problem with Rendering Children

Svelte 5 breaks its own philosophy for the changes to rendering children. Svelte 5's philosophy is about making the framework more explicit and less magical, while remaining simple.

Rendering children is typically done with the reserved keyword `children` in the context of `{@render children()}` or `{@render children?.()}`.

**If you're gonna introduce magic, there's gotta be some obvious denotation that it's magic.**

With runes, it's the `$`.

A "reserved word" is NOT enough, ESPECIALLY not in a context where it is used the same way a non-reserved word is used (in this case, inside `{@render ...}`). The word `children` is simply not enough on its own either.

**This *tricks* the developer into thinking that it ISN'T magic.**

Svelte 5, you had 2 options:
A. Do magic
B. Don't do magic

But you chose C. Do magic but trick/confuse the developer into thinking it's not magic. This is worse than either option.

In my opinion, it should straight up be magic. I understand why it is the way it is right now, but again, I'm not satisfied with "great" or "amazing". Only "exceptional". Where there's a will there's a way. It's not mutually exclusive to have magic look like magic while also following the same principles it is trying to follow in the first place (in this case, it's to denote the 'rules' and 'role' of the `@render` template directive).

Here's my solution:

- First of all, you should *still* be allowed to use `<slot />`, but with no extra parameters. It increases simplicity this way if you are not trying to do anything crazy with it. It should not become deprecated
- Otherwise, make it look like a rune, because it is magic after all via: `{@render $children()}` or `{@render $children?.()}`

Was that *really* that difficult? I can't believe they fumbled the children.

## Conclusion

Svelte 5? Awesome. Perfect? Almost. Just for funsies I submitted an issue to the Svelte repo linking this article, lmk here and in the comments what you think, and make sure to connect with me on my socials and stuff if you want!
