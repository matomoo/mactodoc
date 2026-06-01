---
title: Introduction to Next.js
date: 2026-06-01
description: A beginner-friendly guide covering state, side effects, memoization, routing, and layouts.
---

# Introduction to Next.js

A beginner-friendly guide covering the core building blocks of Next.js — state, side effects, memoization, routing, and layouts.

---

## Table of Contents

1. [What is Next.js?](#1-what-is-nextjs)
2. [useState — Managing State](#2-usestate--managing-state)
3. [useEffect — Side Effects](#3-useeffect--side-effects)
4. [useMemo — Performance](#4-usememo--performance)
5. [Routing — File-based Navigation](#5-routing--file-based-navigation)
6. [Layouts — Shared UI](#6-layouts--shared-ui)

---

## 1. What is Next.js?

Next.js is a framework built on top of React. While React gives you a UI library, Next.js gives you a full structure — routing, server-side rendering, API routes, and more — all ready to go.

> **Think of it this way:** React is the engine, Next.js is the car.

### Getting started

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

Your app runs on `localhost:3000`. Pages live inside the `app/` folder — adding a file there automatically creates a route.

---

## 2. useState — Managing State

`useState` is the most fundamental hook in React. It lets your component remember a value — like a counter, a form input, or a toggle — and re-renders the UI whenever that value changes.

```tsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Add</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

> **Tip:** Never modify state directly. Always use the setter function — that's what tells React to re-render.

---

## 3. useEffect — Side Effects

`useEffect` runs after the component renders. Use it for fetching data, updating the page title, subscribing to events, or setting timers.

```tsx
import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []); // [] = run only once on mount

  return <p>{data ? data.message : "Loading..."}</p>;
}
```

### Dependency array behavior

```tsx
useEffect(() => { ... }, [])        // once on mount
useEffect(() => { ... }, [userId])  // when userId changes
useEffect(() => { ... })            // every render (use rarely)
```

---

## 4. useMemo — Performance

`useMemo` remembers the result of a calculation so React doesn't redo it on every render.

```tsx
import { useMemo, useState } from "react";

export default function Page() {
  const [count, setCount] = useState(10);

  const result = useMemo(() => {
    return count * count;
  }, [count]);

  return (
    <div>
      <p>Squared: {result}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}
```

> **Warning:** Don't wrap every value in `useMemo`. Use it only when a computation is measurably slow.

---

## 5. Routing — File-based Navigation

Every file inside `app/` that exports a default React component becomes a page automatically.

```
app/
├── page.tsx            → /
├── about/
│   └── page.tsx        → /about
├── blog/
│   ├── page.tsx        → /blog
│   └── [slug]/
│       └── page.tsx    → /blog/any-post
└── dashboard/
    └── page.tsx        → /dashboard
```

### Navigating with Link

```tsx
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  );
}
```

### Programmatic navigation with useRouter

```tsx
"use client";
import { useRouter } from "next/navigation";

export default function Form() {
  const router = useRouter();

  function handleSubmit() {
    router.push("/dashboard");
  }

  return <button onClick={handleSubmit}>Submit</button>;
}
```

> **Warning:** Add `'use client'` at the top of any file that uses hooks like `useRouter` or `useState`.

---

## 6. Layouts — Shared UI

A `layout.tsx` file wraps all pages in that folder — perfect for navbars, sidebars, or footers.

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <nav>My App Nav</nav>
        <main>{children}</main>
        <footer>Footer</footer>
      </body>
    </html>
  );
}
```

---

## Summary

| Concept      | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| `useState`   | Track values that change over time                   |
| `useEffect`  | Run code after render (fetch, timers, subscriptions) |
| `useMemo`    | Cache expensive calculations                         |
| File routing | Folders = URLs, no config needed                     |
| `<Link>`     | Fast client-side navigation                          |
| `useRouter`  | Programmatic navigation in Client Components         |
| `layout.tsx` | Shared UI wrapper across pages                       |
