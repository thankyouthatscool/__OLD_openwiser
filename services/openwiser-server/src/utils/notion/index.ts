import { Client } from "@notionhq/client";

export * from "./createNewPages.js";

export * from "./updateClippings.js";
export * from "./updatePages.js";

const NOTION_API_KEY = process.env["NOTION_API_KEY"]!;

export const notionClient = new Client({ auth: NOTION_API_KEY });
