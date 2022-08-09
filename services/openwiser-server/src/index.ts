import { config } from "dotenv";
import { join } from "node:path";

config();

import { handleKindleClippings } from "./utilities";

const CLIP_CONTAINER_PATH = process.env["CLIP_CONTAINER_PATH"]!;

(async () => {
  await handleKindleClippings(join(CLIP_CONTAINER_PATH, "My Clippings.txt"));
})();
