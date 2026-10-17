import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturedImage } from "../FeaturedImage";

vi.mock("next/image", () => ({
  default: (props: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- the mock stands in for next/image
    <img src={props.src} alt={props.alt} width={props.width} height={props.height} />
  ),
}));

const src = "https://cdn.abroadkart.com/blog/visa-tips.webp";

describe("FeaturedImage", () => {
  it("renders the cover with its alt text", () => {
    render(<FeaturedImage src={src} alt="Passport and visa forms" width={840} height={427} />);
    expect(screen.getByRole("img", { name: "Passport and visa forms" })).toHaveAttribute(
      "src",
      src
    );
  });

  it("uses the stored dimensions so the layout does not shift on load", () => {
    render(<FeaturedImage src={src} alt="x" width={840} height={427} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "840");
    expect(img).toHaveAttribute("height", "427");
  });

  it("renders nothing when there is no cover image", () => {
    const { container } = render(
      <FeaturedImage src={undefined} alt="x" width={840} height={427} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
