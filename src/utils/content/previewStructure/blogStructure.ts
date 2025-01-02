import type { CollectionEntry } from "astro:content";
import { BLOG_POSTS_COLUMNS } from "@data/client/constants";
import { attemptDiAdjustment, attemptUniAdjustment, normalizeY } from "./adjustment";
import { PostsRow } from "./rowStructure";

// Total tolerance (for a and b together)
const ADJUSTMENT_TOLERANCE = 2;

// Update states
const RETURN_DEFAULT = true;
const RETURN_REMOVE = false;

type Runnable = () => void;
const MODE_GROUPING: string = "grouping";
//const MODE_NORMAL: string = "normal";

interface LocalPosts {
  row: PostsRow;
  post: CollectionEntry<"blog">;
  nextPost?: CollectionEntry<"blog">;
}

interface RowData {
  colSpan: number;
  localRowSpan: number;
}

interface UpdateReturnSignal {
  rowData: RowData;
  nextRow: boolean;
  nextI: boolean;
}

type Command = "startgroup" | "next:startgroup" | "after:stopgroup";
type ProcedureUpdate = (
  localPosts: LocalPosts,
  rowData: RowData,
  lifecycle: Lifecycle
) => [UpdateReturnSignal, boolean];

/**
 * Lifecycle goes like:
 * startup -> process commands -> run mode updates -> cleanup
 */
class Lifecycle {
  private updates: Map<string, ProcedureUpdate>; // stacked modes
  private allowNormalUpdate: boolean;
  private startupQueue: Runnable[];
  private cleanupQueue: Runnable[];

  constructor() {
    this.updates = new Map<string, ProcedureUpdate>();
    this.allowNormalUpdate = true;
    this.startupQueue = [];
    this.cleanupQueue = [];
  }

  public setAllowNormalUpdate(allow: boolean) {
    this.allowNormalUpdate = allow;
  }

  public startup() {
    for (const startupProc of this.startupQueue) {
      startupProc();
    }

    // flush the buffer
    this.startupQueue = [];
  }

  // initial run
  public processCommands(localPosts: LocalPosts) {
    const cmds: Command[] = localPosts.post.data.commands as Command[];
    for (const cmd of cmds) {
      this.initCommand(cmd, localPosts);
    }
  }

  // on update
  public update(localPosts: LocalPosts, rowData: RowData): UpdateReturnSignal {
    // first, copy this because we will reassign it multiple times
    let returnSignal: UpdateReturnSignal = { rowData: rowData, nextRow: false, nextI: false };

    const removeList = [];

    for (const [modeName, updateProc] of this.updates) {
      const [updateReturnSignal, res] = updateProc(localPosts, returnSignal.rowData, this);
      returnSignal = updateReturnSignal;

      if (res === RETURN_REMOVE) {
        removeList.push(modeName);
      }
    }

    for (const modeNameKey of removeList) {
      this.updates.delete(modeNameKey);
    }

    // Do the normal update if allowed
    if (this.allowNormalUpdate) {
      returnSignal = this.normalUpdate(localPosts, returnSignal.rowData);
    }

    return returnSignal;
  }

  public cleanup() {
    for (const cleanupProc of this.cleanupQueue) {
      cleanupProc();
    }

    // flush the buffer
    this.cleanupQueue = [];
  }

  private normalUpdate(localPosts: LocalPosts, rowData: RowData): UpdateReturnSignal {
    const remainingColSpace = BLOG_POSTS_COLUMNS - rowData.colSpan;
    const currentImportanceX = localPosts.post.data.importanceX;

    if (remainingColSpace === 0) {
      // request a new row
      return {
        rowData: rowData,
        nextRow: true,
        nextI: false,
      };
    }

    if (localPosts.nextPost === undefined) {
      /*console.log(
        "Original Importance (current, next): " + `${localPosts.post.data.importanceX}, null`
      );*/

      const adjustedImportanceX =
        currentImportanceX <= remainingColSpace
          ? currentImportanceX
          : attemptUniAdjustment(currentImportanceX, remainingColSpace, ADJUSTMENT_TOLERANCE);

      localPosts.post.data.importanceX = adjustedImportanceX;

      if (adjustedImportanceX <= remainingColSpace) {
        // add it in
        localPosts.post.data.importanceX = adjustedImportanceX;
        localPosts.post.data.importanceY = normalizeY(localPosts.post.data.importanceY, 0);
        localPosts.row.pushCol([localPosts.post]);
        return {
          rowData: {
            colSpan: rowData.colSpan + localPosts.post.data.importanceX,
            localRowSpan: 0,
          },
          nextRow: false,
          nextI: true,
        };
      } else {
        // request a new row
        return {
          rowData: rowData,
          nextRow: true,
          nextI: false,
        };
      }
    }

    /*console.log(
      "Original Importance (current, next): " +
        `${localPosts.post.data.importanceX}, ${localPosts.nextPost.data.importanceX}`
    );*/

    const nextImportanceX = localPosts.nextPost.data.importanceX;

    const desiredSum = Math.min(
      Math.abs(currentImportanceX) + Math.abs(nextImportanceX),
      Math.max(remainingColSpace, 0)
    );

    const [newCurrentImportanceX, newNextImportanceX] = attemptDiAdjustment(
      currentImportanceX,
      nextImportanceX,
      desiredSum,
      ADJUSTMENT_TOLERANCE,
      true
    );

    //console.log("desiredSum: " + desiredSum);
    /*console.log(
      "New Importance (current, next): " + `${newCurrentImportanceX}, ${newNextImportanceX}`
    );*/

    // Update the values
    localPosts.post.data.importanceX = newCurrentImportanceX;
    localPosts.nextPost.data.importanceX = newNextImportanceX;

    // Calculate the actual absolute sum
    const actualSum = newCurrentImportanceX + Math.abs(newNextImportanceX);

    if (actualSum === 0) {
      // next row signal
      return {
        rowData: rowData, // it's the same because nothing happens in this timeline
        nextRow: true,
        nextI: false,
      };
    } else if (actualSum > desiredSum) {
      // next row, but fill it in
      localPosts.post.data.importanceX = desiredSum;
      localPosts.post.data.importanceY = normalizeY(localPosts.post.data.importanceY, 0);
      localPosts.row.pushCol([localPosts.post]);
      return {
        rowData: {
          colSpan: rowData.colSpan + localPosts.post.data.importanceX,
          localRowSpan: 0, // since a new column was just added, the localRowSpan is reset
        },
        nextRow: true,
        nextI: true,
      };
    } else {
      // successful; add the current post in the column
      localPosts.post.data.importanceY = normalizeY(localPosts.post.data.importanceY, 0);
      localPosts.row.pushCol([localPosts.post]);
      return {
        rowData: {
          colSpan: rowData.colSpan + localPosts.post.data.importanceX,
          localRowSpan: 0, // since a new column was just added, the localRowSpan is reset
        },
        nextRow: false,
        nextI: true,
      };
    }
  }

  private initCommand(cmd: Command, localPosts: LocalPosts) {
    const startGroup: Runnable = () => {
      this.allowNormalUpdate = false;
      localPosts.row.newEmptyCol();
      this.updates.set(MODE_GROUPING, groupingUpdate);
    };

    switch (cmd) {
      case "next:startgroup":
        this.startupQueue.push(startGroup);
        break;
      case "startgroup":
        startGroup();
        break;
      case "after:stopgroup":
        this.cleanupQueue.push(() => {
          this.updates.delete(MODE_GROUPING);
          this.allowNormalUpdate = true;
        });
        break;
      default:
        break;
    }
  }
}

// For some reason, putting this outside of a class method somehow makes it easier to debug
/// returns boolean denoting success or not
/// if not success, exit grouping mode
function groupingUpdate(
  localPosts: LocalPosts,
  rowData: RowData,
  lifecycle: Lifecycle
): [UpdateReturnSignal, boolean] {
  const remainingColSpace = BLOG_POSTS_COLUMNS - rowData.colSpan;
  const currentImportanceX = localPosts.post.data.importanceX;

  // NOTE: localPosts.row[numCols - 1] is the current localRow
  const numCols: number = localPosts.row.getNumCols();

  if (numCols < 1) {
    // failure
    lifecycle.setAllowNormalUpdate(true);
    return [{ rowData: rowData, nextRow: false, nextI: false }, RETURN_REMOVE];
  }

  if (localPosts.row.getCol(numCols - 1).length === 0) {
    // first post of the group
    const adjustedImportanceX = attemptUniAdjustment(
      currentImportanceX,
      remainingColSpace,
      ADJUSTMENT_TOLERANCE
    );

    if (adjustedImportanceX <= remainingColSpace) {
      // success (it can fit in)
      localPosts.post.data.importanceX = adjustedImportanceX;
      localPosts.post.data.importanceY = normalizeY(localPosts.post.data.importanceY, 0);
      localPosts.row.pushSubrowToCol(numCols - 1, localPosts.post);
      return [
        {
          rowData: {
            colSpan: rowData.colSpan + localPosts.post.data.importanceX,
            localRowSpan: localPosts.post.data.importanceY,
          },
          nextRow: false,
          nextI: true,
        },
        RETURN_DEFAULT,
      ];
    } else {
      // failure; request a new row
      // but don't stop the grouping from occurring
      return [{ rowData: rowData, nextRow: true, nextI: false }, RETURN_DEFAULT];
    }
  }

  // Not the first post of the group
  const firstPost: CollectionEntry<"blog"> = localPosts.row.getPost(numCols - 1, 0);
  const desiredWidth = firstPost.data.importanceX;
  const desiredHeight = firstPost.data.importanceY;

  const adjustedImportanceX = attemptUniAdjustment(
    currentImportanceX,
    desiredWidth,
    ADJUSTMENT_TOLERANCE
  );

  if (adjustedImportanceX === desiredWidth) {
    // success
    localPosts.post.data.importanceX = adjustedImportanceX;
    localPosts.post.data.importanceY = normalizeY(
      localPosts.post.data.importanceY,
      rowData.localRowSpan,
      desiredHeight
    );
    localPosts.row.pushSubrowToCol(numCols - 1, localPosts.post);
    return [
      {
        rowData: {
          colSpan: rowData.colSpan,
          localRowSpan: rowData.localRowSpan + localPosts.post.data.importanceY,
        },
        nextRow: false,
        nextI: true,
      },
      RETURN_DEFAULT,
    ];
  } else {
    // failure
    lifecycle.setAllowNormalUpdate(true);
    return [{ rowData: rowData, nextRow: false, nextI: false }, RETURN_REMOVE];
  }
}

// Given a sorted list of posts:
// Choose the rows
// Correction for robustness to noise
// returned dimensions are [rows, cols, rowsInsideCols]
export function generateRows(
  posts: CollectionEntry<"blog">[],
  startIdx = 0,
  maxRows = -1
): PostsRow[] {
  //console.log("maxRows:", maxRows);

  const rows: PostsRow[] = [new PostsRow()];

  let rowIndex = 0;
  let row: PostsRow = rows[rowIndex];

  let rowData: RowData = {
    colSpan: 0,
    localRowSpan: 0,
  };

  // returns success or not
  function nextRow(): boolean {
    //console.log("calling nextRow");
    //console.log("rows.length:", rows.length);

    if (maxRows > 0 && rows.length >= maxRows) {
      //console.log("nextRow failed");
      return false;
    }

    // otherwise, do the thing
    rows.push(new PostsRow());
    row = rows[++rowIndex];

    rowData.colSpan = 0;
    rowData.localRowSpan = 0;

    //console.log("new row: " + rowIndex);

    return true;
  }

  const lifecycle: Lifecycle = new Lifecycle();

  let i = startIdx;

  while (i < posts.length - 1) {
    const localPosts: LocalPosts = {
      post: sanitize(posts[i]),
      nextPost: posts[i + 1],
      row: row,
    };

    // On startup of i
    lifecycle.startup();

    // Collect signals from post
    lifecycle.processCommands(localPosts);

    // Update
    const signal: UpdateReturnSignal = lifecycle.update(localPosts, rowData);

    // Cleanup
    lifecycle.cleanup();

    // Update data from signal
    rowData = signal.rowData;

    if (signal.nextI) {
      //console.log("nextI: " + (i + 1));
      ++i;
    }

    // Add new row if necessary
    if (signal.nextRow) {
      const success = nextRow();
      if (!success) {
        // just return the rows here, since we've reached the maxRows
        return rows;
      }
    }
  }

  // For the last of these
  while (true) {
    const localPosts: LocalPosts = {
      post: sanitize(posts[posts.length - 1]),
      row: row,
    };

    lifecycle.startup();

    lifecycle.processCommands(localPosts);

    const signal: UpdateReturnSignal = lifecycle.update(localPosts, rowData);

    // Update data from signal
    rowData = signal.rowData;

    // Cleanup
    lifecycle.cleanup();

    if (signal.nextI) {
      // break out of the loop
      break;
    }

    if (signal.nextRow) {
      const success = nextRow();
      if (!success) {
        // just return the rows here, since we've reached the maxRows
        return rows;
      }
    }
  }

  return rows;
}

// sanitize the post
function sanitize(post: CollectionEntry<"blog">): CollectionEntry<"blog"> {
  // Sanitize the date first
  post.data.pubDatetime = new Date(post.data.pubDatetime);
  post.data.modDatetime = new Date(post.data.modDatetime);

  // do any other sanitization you need to do here

  return post;
}
