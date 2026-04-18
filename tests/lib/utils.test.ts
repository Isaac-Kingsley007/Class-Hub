import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and removes tailwind conflicts", () => {
    const result = cn("px-2", "px-4", "text-sm", false && "hidden", undefined);

    expect(result).toBe("px-4 text-sm");
  });

  it("handles conditional and array inputs", () => {
    const isActive = true;
    const result = cn("base", ["rounded", isActive && "font-semibold"], {
      "bg-green-500": isActive,
      "bg-gray-300": !isActive,
    });

    expect(result).toContain("base");
    expect(result).toContain("rounded");
    expect(result).toContain("font-semibold");
    expect(result).toContain("bg-green-500");
    expect(result).not.toContain("bg-gray-300");
  });
});
