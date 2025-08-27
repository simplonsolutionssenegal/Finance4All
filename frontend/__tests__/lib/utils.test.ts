import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should be a function", () => {
    expect(typeof cn).toBe("function");
  });

  it("combines class names correctly", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("handles single class name", () => {
    const result = cn("single-class");
    expect(result).toBe("single-class");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("filters out falsy values", () => {
    const result = cn("class1", false, "class2", null, "class3", undefined);
    expect(result).toBe("class1 class2 class3");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn("base", isActive && "active", isDisabled && "disabled");
    expect(result).toBe("base active");
  });

  it("merges Tailwind classes correctly", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("handles array of classes", () => {
    const result = cn(["class1", "class2"], "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("handles object with conditional classes", () => {
    const result = cn({
      "base-class": true,
      "active-class": true,
      "inactive-class": false,
    });
    expect(result).toBe("base-class active-class");
  });

  it("handles complex Tailwind merge scenarios", () => {
    const result = cn(
      "bg-red-500 text-white p-4",
      "bg-blue-500 p-2"
    );
    expect(result).toBe("text-white bg-blue-500 p-2");
  });

  it("handles mixed input types", () => {
    const result = cn(
      "base",
      ["array-class1", "array-class2"],
      {
        "object-class": true,
        "false-class": false,
      },
      "final-class"
    );
    expect(result).toBe("base array-class1 array-class2 object-class final-class");
  });

  it("handles duplicate classes", () => {
    const result = cn("duplicate", "other", "duplicate");
    expect(result).toBe("duplicate other duplicate");
  });

  it("handles whitespace and empty strings", () => {
    const result = cn("  class1  ", "", "   ", "class2");
    expect(result).toBe("class1 class2");
  });

  it("handles Tailwind responsive classes", () => {
    const result = cn("text-sm md:text-base", "text-lg md:text-xl");
    expect(result).toBe("text-lg md:text-xl");
  });

  it("handles Tailwind hover and focus states", () => {
    const result = cn(
      "bg-blue-500 hover:bg-blue-600",
      "bg-red-500 hover:bg-red-600"
    );
    expect(result).toBe("bg-red-500 hover:bg-red-600");
  });

  it("preserves non-conflicting classes when merging", () => {
    const result = cn(
      "text-white font-bold rounded",
      "bg-blue-500 shadow-lg"
    );
    expect(result).toBe("text-white font-bold rounded bg-blue-500 shadow-lg");
  });
});