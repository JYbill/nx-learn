import { describe, expect, it } from "vitest";
import { common } from "./common.js";

describe("common", () => {
  it("should work", () => {
    expect(common()).toEqual("common");
  });
});
