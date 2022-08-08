import { watch } from "chokidar";
import { config } from "dotenv";
import { parse } from "node:path";

config();

import { handleKindleClippings } from "./utilities";

const CLIP_CONTAINER_PATH = process.env["CLIP_CONTAINER_PATH"]!;

const watcher = watch(CLIP_CONTAINER_PATH);

watcher.on("all", async (event, path) => {
  if (event === "add" || event === "change") {
    const { base } = parse(path);
    if (base === "My Clippings.txt") {
      await handleKindleClippings(path);
    }
  }
});
