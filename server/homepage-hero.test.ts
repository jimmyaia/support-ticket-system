import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homePageSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("homepage hero contact cards", () => {
  it("presents the four supported support entry points", () => {
    expect(homePageSource).toContain("One ticket number");
    expect(homePageSource).toContain("Web Form");
    expect(homePageSource).toContain("Live Chat");
    expect(homePageSource).toContain("Text Us");
    expect(homePageSource).toContain("Call Us");
  });

  it("keeps the web form linked to the public ticket submission route", () => {
    expect(homePageSource).toContain('href: "/submit"');
    expect(homePageSource).toContain('action: "Try it"');
  });
});
