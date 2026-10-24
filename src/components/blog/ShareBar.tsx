import { FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { buildShareLinks } from "@app/lib/blog/share";
import { CopyLinkButton } from "./CopyLinkButton";

const shareClass =
  "inline-flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

/**
 * Copy-link and share buttons for a post. The share links are plain anchors
 * that open in a new tab, so they work without JavaScript.
 */
export function ShareBar({
  url,
  title,
  label,
  align = "center",
}: {
  url: string;
  title: string;
  label?: string;
  align?: "center" | "start";
}) {
  const links = buildShareLinks(url, title);
  const justify = align === "center" ? "justify-center" : "justify-start";

  return (
    <div className={`flex flex-col gap-3 ${align === "center" ? "items-center" : "items-start"}`}>
      {label && <p className="text-sm font-semibold text-gray-900">{label}</p>}
      <ul className={`flex list-none flex-wrap gap-2 pl-0 ${justify}`}>
        <li>
          <CopyLinkButton url={url} />
        </li>
        <li>
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
            className={shareClass}
          >
            <FaWhatsapp aria-hidden="true" className="size-4" />
          </a>
        </li>
        <li>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
            className={shareClass}
          >
            <FaLinkedinIn aria-hidden="true" className="size-4" />
          </a>
        </li>
        <li>
          <a
            href={links.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
            className={shareClass}
          >
            <FaXTwitter aria-hidden="true" className="size-4" />
          </a>
        </li>
      </ul>
    </div>
  );
}
