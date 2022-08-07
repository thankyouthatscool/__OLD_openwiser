import { watch } from "chokidar";
import { config } from "dotenv";

import {
  insertClippingsIntoNotionPages,
  updateKindleClippings,
  updateSources,
  updateUserPages,
} from "./utils/database/index.js";
import {
  kindleClippingsParser,
  normalizeKindleClippings,
} from "./utils/parsers/index.js";

config();

const CLIP_CONTAINER_PATH = process.env["CLIP_CONTAINER_PATH"]!;

const watcher = watch(CLIP_CONTAINER_PATH);

watcher.on("all", async (event, path) => {
  if (event === "add") {
    const formattedClippings = kindleClippingsParser(path);

    const normalizedClippings = normalizeKindleClippings(formattedClippings);

    const sources = Object.keys(normalizedClippings);

    await updateSources(sources);

    await updateUserPages(sources);

    const newClippings = await updateKindleClippings(normalizedClippings);

    await insertClippingsIntoNotionPages(newClippings);

    console.log("DONE!");
  }
});
