import { BLOG_POSTS_ROWS_SCALE } from "@data/client/constants";

// val = importanceY
// currentFilled is obvious; > 0
// defaultVal is the defaultValue you want; > 0
function normalizeY(
  val: number,
  currentFilled: number,
  defaultVal = Number.MAX_SAFE_INTEGER
): number {
  if (val === 0) {
    const remaining = BLOG_POSTS_ROWS_SCALE - currentFilled;
    return Math.min(remaining, defaultVal);
  }

  return Math.abs(val);
}

// importances
// current: the reality
// desired: the thing to fit
function attemptUniAdjustment(current: number, desired: number, tolerance: number): number {
  const abs_current = Math.abs(current);

  // 0 means auto-adjust
  if (current === 0) {
    return desired;
  }

  // Either it matches perfectly or it shouldn't adjust (current < 0)
  if (abs_current === desired || current < 0) {
    return abs_current;
  }

  return attemptAlign(abs_current, desired, tolerance);
}

// desiredSum will typically either be BLOG_POSTS_COLUMNS or BLOG_POSTS_ROWS_SCALE; it also must be an int > 1
// For importances (a and b):
//  Negative = don't adjust me
//  Positive = this is my preference, but I'm ok with being adjusted to an extent
//  0        = auto-adjust me to your liking
// defaultValue is just the standard value to use if it doesn't know. -1 (or <= 0) defaults to using the halves of desiredSum
// regardless, it does make them positive. The way to check whether success is if their sum = desiredSum
// next row means the adjusted b === 0 or the sum of the adjusted > desiredSum
function attemptDiAdjustment(
  a: number,
  b: number,
  desiredSum: number,
  tolerance: number,
  keepBSignOnDefault = false,
  minSumToSplit = 2,
  defaultValue = -1
): [number, number] {
  const abs_a = Math.abs(a);
  const abs_b = Math.abs(b);

  // Take care of bidirectional cases first

  if (abs_a === desiredSum || desiredSum <= 0 || abs_a + abs_b === desiredSum || (a < 0 && b < 0)) {
    // Nothing needs to change
    return keepBSignOnDefault ? [abs_a, b] : [abs_a, abs_b];
  }

  const useCustomDefaultVal: boolean = defaultValue > 0;
  const defaultVal: number = useCustomDefaultVal
    ? defaultValue
    : desiredSum >= minSumToSplit
      ? Math.floor(desiredSum / 2)
      : 0;

  if (a === 0 && b === 0) {
    // yes, this is done with B first so A gets priority
    const adjB = defaultVal;
    const adjA = useCustomDefaultVal ? defaultVal : desiredSum - adjB;

    return [adjA, adjB];
  }

  if (a > 0 && b > 0) {
    // x = AC / (B + A)
    // y = BC / (B + A) = C - x
    const xa = (abs_a * desiredSum) / (abs_b + abs_a);
    const y = (x: number): number => desiredSum - x;

    // Now, take the 2 closest ints and use whichever one has a ratio closer A/B
    const ratio = abs_a / abs_b;

    const xa1 = Math.floor(xa);
    const yb1 = y(xa1);

    const ratio1 = xa1 / yb1;
    const deltaRatio1 = Math.abs(ratio1 - ratio);

    const xa2 = Math.ceil(xa);
    const yb2 = y(xa2);

    const ratio2 = xa2 / yb2;
    const deltaRatio2 = Math.abs(ratio2 - ratio);

    if (deltaRatio2 <= deltaRatio1) {
      // second one wins
      return [xa2, yb2];
    } else {
      // first one wins
      return [xa1, yb1];
    }
  }

  // The rest of the cases can be treated unidirectionally

  const adjs: [number, number] = [abs_a, abs_b];

  const vals = [a, b];
  const abs_vals = [abs_a, abs_b];

  for (let idx = 0; idx < vals.length; idx++) {
    const inv_idx = invertBinary(idx);

    const val = vals[idx];
    const inv_val = vals[inv_idx];

    const abs_val = abs_vals[idx];
    //const abs_inv_val = abs_vals[inv_idx];

    if (val < 0 && inv_val === 0) {
      const adj_inv = abs_val >= desiredSum ? defaultVal : desiredSum - abs_val;

      adjs[idx] = abs_val;
      adjs[inv_idx] = adj_inv;

      return adjs;
    } else if (val > 0 && inv_val === 0) {
      const adj = val > desiredSum ? attemptAlign(abs_val, desiredSum, tolerance) : val;
      const adj_inv = adj === desiredSum ? defaultVal : desiredSum - adj;

      adjs[idx] = adj;
      adjs[inv_idx] = adj_inv;

      return adjs;
    } else if (val < 0 && inv_val > 0) {
      let adj_inv: number;
      if (abs_val >= desiredSum) {
        adj_inv = inv_val;
      } else {
        // abs_val < desiredSum
        adj_inv = attemptAlign(inv_val, desiredSum - abs_val, tolerance);
      }

      adjs[idx] = abs_val;
      adjs[inv_idx] = adj_inv;

      return adjs;
    }
  }
}

// must be > 0
// failure = returns the abs_val
function attemptAlign(abs_val: number, abs_to: number, tolerance: number): number {
  const dist = Math.abs(abs_to - abs_val);

  if (dist <= tolerance) {
    // adjust it
    return abs_to;
  }

  // otherwise, don't adjust
  return abs_val;
}

function invertBinary(x: number): number {
  return -1 * x + 1;
}

export { normalizeY, attemptUniAdjustment, attemptDiAdjustment };
