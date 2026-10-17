import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlugCached, getRelatedPosts } from "@app/lib/blog/repository";
import { buildPostJsonLd, buildPostMetadata, serializeJsonLd } from "@app/lib/blog/seo";
import { buildToc } from "@app/lib/blog/toc";
import { shouldRenderFaqSection } from "@app/lib/blog/faq";
import { getPublicAppUrl } from "@app/lib/public-urls";
import type { TocItem } from "@app/lib/blog/types";
import { ArticleBody } from "@app/components/blog/ArticleBody";
import { Breadcrumbs } from "@app/components/blog/Breadcrumbs";
import { CategoryChip } from "@app/components/blog/CategoryChip";
import { FaqSection } from "@app/components/blog/FaqSection";
import { FeaturedImage } from "@app/components/blog/FeaturedImage";
import { LeadCtaBanner } from "@app/components/blog/LeadCtaBanner";
import { LeadForm } from "@app/components/blog/LeadForm";
import { PostMeta } from "@app/components/blog/PostMeta";
import { ReadingProgress } from "@app/components/blog/ReadingProgress";
import { RelatedPosts } from "@app/components/blog/RelatedPosts";
import { ShareBar } from "@app/components/blog/ShareBar";
import { TableOfContents } from "@app/components/blog/TableOfContents";
import { TocHighlighter } from "@app/components/blog/TocHighlighter";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugCached(slug);
  if (!post) return {};
  return buildPostMetadata(post);
}

function flattenIds(items: TocItem[]): string[] {
  return items.flatMap((item) => [item.id, ...flattenIds(item.children ?? [])]);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlugCached(slug);
  if (!post || post.status !== "published") notFound();

  const related = await getRelatedPosts(post, 3).catch(() => []);

  const showFaq = shouldRenderFaqSection(post);
  const toc = buildToc(post.headings);
  const tocItems = showFaq
    ? [...toc, { level: 2, text: "Frequently Asked Questions", id: "faq" }]
    : toc;

  const postUrl = `${getPublicAppUrl()}/blogs/${post.slug}`;
  const jsonLd = serializeJsonLd(buildPostJsonLd(post));

  return (
    <>
      <div id="top" />
      <ReadingProgress />
      <TocHighlighter ids={flattenIds(tocItems)} />

      <header className="bg-gradient-to-b from-blue-50/70 via-white to-white pt-28 pb-10 md:pt-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="flex justify-center">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blogs", href: "/blogs" },
                { label: post.title },
              ]}
            />
          </div>

          {post.primaryCategory && (
            <div className="mt-6">
              <CategoryChip category={post.primaryCategory} />
            </div>
          )}

          <h1 className="mt-4 text-balance text-[2rem] font-bold leading-[1.1] tracking-[-0.025em] text-gray-900 md:text-5xl lg:text-[3.25rem]">
            {post.title}
          </h1>

          <div className="mt-6">
            <PostMeta
              authorName={post.authorName}
              publishedAt={post.publishedAt}
              modifiedAt={post.modifiedAt}
              readingTimeMinutes={post.readingTimeMinutes}
            />
          </div>

          <div className="mt-6">
            <ShareBar url={postUrl} title={post.title} />
          </div>
        </div>
      </header>

      <div className="mt-6 md:mt-10">
        <FeaturedImage
          src={post.featuredImageUrl}
          alt={post.featuredImageAlt || post.title}
          width={post.featuredImageWidth}
          height={post.featuredImageHeight}
        />
      </div>

      <div className="mx-auto mt-12 px-4 sm:px-6 lg:grid lg:grid-cols-[200px_minmax(0,720px)] lg:justify-center lg:gap-x-12 xl:max-w-[1400px] xl:grid-cols-[220px_minmax(0,720px)_300px]">
        <div className="mx-auto mb-10 w-full max-w-[720px] lg:hidden">
          <TableOfContents items={tocItems} variant="inline" />
        </div>

        <div className="hidden lg:block">
          <TableOfContents items={tocItems} variant="sidebar" />
        </div>

        <div className="mx-auto w-full min-w-0 max-w-[720px]">
          <ArticleBody html={post.contentHtml} />

          {showFaq && <FaqSection faqs={post.faqs} />}

          {showFaq && (
            <div className="mt-12 border-t border-gray-100 pt-8">
              <ShareBar url={postUrl} title={post.title} label="Share this article" align="start" />
            </div>
          )}

          <div className="mt-12 xl:hidden">
            <LeadForm sourceSlug={post.slug} />
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <LeadForm sourceSlug={post.slug} />
          </div>
        </aside>
      </div>

      <div className="mx-auto mt-20 max-w-5xl px-4 sm:px-6">
        <LeadCtaBanner sourceSlug={post.slug} />
      </div>

      <div className="mt-20">
        <RelatedPosts posts={related} category={post.primaryCategory} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </>
  );
}
