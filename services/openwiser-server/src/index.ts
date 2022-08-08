import chalk from "chalk";
import { watch } from "chokidar";
import { config } from "dotenv";
import { parse } from "node:path";

import {
  createNewPages,
  kindleClippingsParser,
  normalizeKindleClippings,
  notionClient,
  prisma,
  updateClippings,
  updateDatabaseClippings,
  updateDatabaseSources,
  updatePages,
} from "./utils/index.js";

config();

const CLIP_CONTAINER_PATH = process.env["CLIP_CONTAINER_PATH"]!;

const watcher = watch(CLIP_CONTAINER_PATH);

watcher.on("all", async (event, path) => {
  if (["add", "change"].includes(event)) {
    const { base } = parse(path);

    if (base === "My Clippings.txt") {
      const formattedClippings = kindleClippingsParser(path);

      console.log(
        chalk.underline(
          chalk.blue(
            `${chalk.bold(formattedClippings.length)} clippings parsed!\n`
          )
        )
      );

      const normalizedKindleClippings =
        normalizeKindleClippings(formattedClippings);

      const sources = Object.keys(normalizedKindleClippings);

      const newSources = await updateDatabaseSources(sources);

      if (!!newSources && !!newSources.length) {
        console.log(
          `${chalk.yellow("New Sources Created")}\n${chalk.blue(
            newSources.map((source) => `\n${source?.author} - ${source?.title}`)
          )}\n`
        );

        await createNewPages(newSources);
      } else {
        console.log("No New Sources\n");
      }

      const newClippings = await updateDatabaseClippings(
        normalizedKindleClippings
      );

      if (!!newClippings.length) {
        //@ts-ignore
        await updateClippings(newClippings);
      } else {
        console.log("No New Clippings\n");
      }

      await updatePages();

      console.log(chalk.green.bold("Done!"));
    }
  }
});
