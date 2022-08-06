import { watch } from "chokidar";
import { config } from "dotenv";

import { kindleClippingsParser } from "./utils/parsers/kindleClippingsParser.js";

config();

const CLIP_CONTAINER_PATH = process.env["CLIP_CONTAINER_PATH"]!;

const watcher = watch(CLIP_CONTAINER_PATH);

watcher.on("all", (event, path) => {
  if (event === "add") {
    const formattedClippings = kindleClippingsParser(path);

    console.log(formattedClippings);
  }
});
