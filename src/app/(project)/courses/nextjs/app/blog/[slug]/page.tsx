import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllPosts, getPostBySlug } from "../../../lib/posts";

type Props = {
  params: Promise<{ slug: string }>;
};

// Pre-generate all known slugs at build time
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// Set the page <title> dynamically from frontmatter
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post?.title ?? "Post not found" };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1rem" }}>
      <Link href="/blog" style={{ fontSize: "0.85rem", color: "#666" }}>
        ← Back to blog
      </Link>

      <h1 style={{ marginTop: "1.5rem", marginBottom: "0.25rem" }}>{post.title}</h1>

      {post.date && <time style={{ fontSize: "0.85rem", color: "#999" }}>{post.date}</time>}

      {/* Render the parsed markdown HTML */}
      <article
        className="prose"
        style={{ marginTop: "2rem" }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <none>
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </main>
  );
}
