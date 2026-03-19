import type { MiniDoc, MiniDocStorage } from "../contracts/storage";

export class MiniDocStorageDummy implements MiniDocStorage {
  async load(id: string): Promise<MiniDoc | null> {
    switch (id) {
      case "float-precision":
        return {
          content_md:
            "In python, and most other languages, `float` numbers are stored with limited precision.",
          tags: ["float", "precision"],
        };
      case "ndarray":
        return {
          content_md:
            "The numpy package provides the `ndarray` datatype. Unlike Python's `list` it has a fixed size and all elements have the same datatype",
          tags: ["numpy", "datatypes"],
        };
      default:
        return null;
    }
  }
}
