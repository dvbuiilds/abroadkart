import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostMeta } from "../PostMeta";

const published = new Date("2024-07-12T10:00:00.000Z");

describe("PostMeta", () => {
  it("shows the author as plain text with no link or image", () => {
    const { container } = render(
      <PostMeta authorName="Rahul Sharma" publishedAt={published} modifiedAt={published} />
    );
    const authorText = screen.getByText("By Rahul Sharma");
    expect(authorText.querySelector("a, img")).toBeNull();
    expect(container.querySelector("a, img")).toBeNull();
  });

  it("marks the publish date with a machine-readable time element", () => {
    const { container } = render(
      <PostMeta publishedAt={published} modifiedAt={published} />
    );
    const time = container.querySelector("time[datetime]");
    expect(time).toHaveAttribute("datetime", "2024-07-12T10:00:00.000Z");
    expect(time).toHaveTextContent("12 Jul 2024");
  });

  it("shows Updated only when the Indian calendar day differs", () => {
    render(
      <PostMeta
        publishedAt={published}
        modifiedAt={new Date("2025-03-03T09:00:00.000Z")}
      />
    );
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    expect(screen.getByText("3 Mar 2025")).toBeInTheDocument();
  });

  it("omits Updated when the modified date is the same day", () => {
    render(
      <PostMeta
        publishedAt={published}
        modifiedAt={new Date("2024-07-12T12:00:00.000Z")}
      />
    );
    expect(screen.queryByText(/Updated/)).toBeNull();
  });

  it("omits Updated when the times differ but the Indian day is the same", () => {
    render(
      <PostMeta
        publishedAt={new Date("2024-07-11T23:30:00.000Z")}
        modifiedAt={new Date("2024-07-12T00:10:00.000Z")}
      />
    );
    expect(screen.queryByText(/Updated/)).toBeNull();
  });

  it("shows the reading time when given", () => {
    render(
      <PostMeta
        publishedAt={published}
        modifiedAt={published}
        readingTimeMinutes={6}
      />
    );
    expect(screen.getByText("6 min read")).toBeInTheDocument();
  });
});
