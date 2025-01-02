//import { atom } from "nanostores";
//import { persistentAtom } from "@nanostores/persistent";

// i hate js i hate js i hate js i hate js i hate js i hate js i hate js
export function persistentAtomValueIsNull(val): boolean {
  return val === null || val === undefined || val === "undefined" || val === "null";
}

// i hate js i hate js i hate js i hate js i hate js i hate js i hate js
export function persistentAtomIsNull(persistent_atom): boolean {
  return persistentAtomValueIsNull(persistent_atom.get());
}
