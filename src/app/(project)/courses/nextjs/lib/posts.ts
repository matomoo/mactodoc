import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";
import html from "remark-html";

const contentDir = path.join(process.cwd(), "src/app/(project)/courses/nextjs/content");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description?: string;
};

export type Post = PostMeta & {
  contentHtml: string;
};

// Get metadata for all posts (used on the blog index page)
export function getAllPosts(): PostMeta[] {
  const filenames = fs.readdirSync(contentDir);

  return filenames
    .filter((name) => name.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const filePath = path.join(contentDir, filename);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContent);

      return {
        slug,
        title: data.title ?? slug,
        date: data.date instanceof Date ? data.date.toISOString().split("T")[0] : String(data.date ?? ""),
        description: data.description ?? "",
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
}

// Get a single post by slug (used on the [slug] page)
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(contentDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return {
    slug,
    title: data.title ?? slug,
    date: data.date instanceof Date ? data.date.toISOString().split("T")[0] : String(data.date ?? ""),
    description: data.description ?? "",
    contentHtml,
  };
}
