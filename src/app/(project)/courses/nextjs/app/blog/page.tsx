import Link from "next/link";

import { getAllPosts } from "../../lib/posts";

export const metadata = {
  title: "Blog",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Blog</h1>
      <ul style={{ listStyle: "none", padding: 0, marginTop: "1.5rem" }}>
        {posts.map((post) => (
          <li
            key={post.slug}
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: "1.25rem",
              marginBottom: "1.25rem",
            }}
          >
            <Link href={`/courses/nextjs/app/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>{post.title}</h2>
            </Link>
            {post.description && (
              <p style={{ color: "#666", fontSize: "0.9rem", margin: "4px 0" }}>{post.description}</p>
            )}
            {post.date && <time style={{ fontSize: "0.8rem", color: "#999" }}>{post.date}</time>}
          </li>
        ))}
      </ul>
    </main>
  );
}
