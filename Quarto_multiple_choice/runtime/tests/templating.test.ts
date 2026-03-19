import { expect, test } from "vitest";
import { FdbkTemplate } from "../src/ai/templating";

test("simple", () => {
  const tmpl = new FdbkTemplate("Here goes {{SOMETHING}} cool. {{X}}");
  expect(tmpl.render({ SOMETHING: "that", X: "123", EXTRA: "456" })).toBe(
    "Here goes that cool. 123",
  );
});

test("error if missing", () => {
  const tmpl = new FdbkTemplate("Here goes {{SOMETHING}} cool. {{X}}");
  expect(() => tmpl.render({ X: "123", EXTRA: "456" })).toThrow(
    "Missing fill value",
  );
});
