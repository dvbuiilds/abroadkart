import Image from "next/image";

/**
 * Cover image at its native width (840px). It is never stretched, and the
 * stored dimensions reserve the space so the page does not shift on load.
 */
export function FeaturedImage({
  src,
  alt,
  width,
  height,
}: {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  if (!src || !width || !height) return null;

  return (
    <figure className="mx-auto max-w-[840px] px-4 sm:px-6">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority
        sizes="(min-width: 880px) 840px, 100vw"
        className="h-auto w-full rounded-2xl shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5"
      />
    </figure>
  );
}
