/** Share-sheet URLs for a post. Both arguments are encoded here. */
export function buildShareLinks(
  url: string,
  title: string
): { whatsapp: string; linkedin: string; x: string } {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`,
  };
}
