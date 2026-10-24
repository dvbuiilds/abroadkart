import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { TocHighlighter } from "../TocHighlighter";

type Callback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;

let lastCallback: Callback | null = null;
const observe = vi.fn();
const disconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: Callback) {
    lastCallback = callback;
  }
  observe = observe;
  disconnect = disconnect;
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}

function renderPage() {
  return render(
    <>
      <nav aria-label="Table of contents">
        <a href="#a">Section A</a>
        <a href="#b">Section B</a>
      </nav>
      <h2 id="a">Section A</h2>
      <h2 id="b">Section B</h2>
      <TocHighlighter ids={["a", "b"]} />
    </>
  );
}

describe("TocHighlighter", () => {
  beforeEach(() => {
    lastCallback = null;
    observe.mockClear();
    disconnect.mockClear();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("observes every heading it was given", () => {
    renderPage();
    expect(observe).toHaveBeenCalledTimes(2);
  });

  it("marks the entry whose heading is in view as the current location", () => {
    const { container } = renderPage();
    const headingB = container.querySelector<HTMLElement>("#b")!;

    lastCallback!([{ isIntersecting: true, target: headingB }]);

    expect(container.querySelector('a[href="#b"]')).toHaveAttribute("aria-current", "location");
    expect(container.querySelector('a[href="#a"]')).not.toHaveAttribute("aria-current");
  });

  it("moves the mark when a different heading comes into view", () => {
    const { container } = renderPage();
    const headingA = container.querySelector<HTMLElement>("#a")!;
    const headingB = container.querySelector<HTMLElement>("#b")!;

    lastCallback!([{ isIntersecting: true, target: headingA }]);
    lastCallback!([{ isIntersecting: true, target: headingB }]);

    expect(container.querySelector('a[href="#a"]')).not.toHaveAttribute("aria-current");
    expect(container.querySelector('a[href="#b"]')).toHaveAttribute("aria-current", "location");
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = renderPage();
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("renders no markup of its own", () => {
    const { container } = render(<TocHighlighter ids={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
