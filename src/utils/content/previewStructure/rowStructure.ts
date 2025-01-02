import type { CollectionEntry } from "astro:content";

class PostsRow {
  public row: CollectionEntry<"blog">[][];
  public totalLength: number;

  constructor() {
    this.row = [];
    this.totalLength = 0;
  }

  public getNumCols(): number {
    return this.row.length;
  }

  public getCol(colIdx: number): CollectionEntry<"blog">[] {
    return this.row[colIdx];
  }

  public getPost(colIdx: number, subrowIdx: number): CollectionEntry<"blog"> {
    return this.row[colIdx][subrowIdx];
  }

  public newEmptyCol() {
    this.row.push([]); // empty as shit bro
  }

  public pushCol(columnPosts: CollectionEntry<"blog">[]) {
    this.row.push(columnPosts);
    this.totalLength += columnPosts.length;
  }

  /// pushing a localRow (row of a column)
  public pushSubrowToCol(colIdx: number, post: CollectionEntry<"blog">) {
    this.row[colIdx].push(post);
    this.totalLength += 1;
  }

  // just in case
  public manualCalculateTotalLength(): number {
    let totalLength = 0;
    for (const colGroup of this.row) {
      totalLength += colGroup.length;
    }

    return totalLength;
  }
}

function sumTotalLengths(postsRows: PostsRow[]): number {
  let len = 0;
  for (const postsRow of postsRows) {
    len += postsRow.totalLength;
  }

  return len;
}

export { PostsRow, sumTotalLengths };
