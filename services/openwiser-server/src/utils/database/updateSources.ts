import { Client } from "@notionhq/client";

import { prisma } from "./index.js";
import { parseTitle } from "../parsers/index.js";

export const updateSources = async (sources: string[]) => {
  const sourcesModelMap = sources.map((source) => {
    const { author, title } = parseTitle(source);

    return { author, title };
  });

  await prisma.source.createMany({
    data: sourcesModelMap,
    skipDuplicates: true,
  });
};

export const updateUserPages = async (sources: string[]) => {
  const sourcesWithId = await Promise.all(
    sources.map(async (source) => {
      const { author, title } = parseTitle(source);

      const targetSource = await prisma.source.findFirst({
        where: { title },
      });

      const targetSourceId = targetSource!.id;
      const targetSourceCoverUrl = targetSource!.coverUrl;

      return {
        author,
        targetSourceCoverUrl,
        targetSourceId,
        title,
      };
    })
  );

  const notionPagesToCreate = await sourcesWithId.reduce(
    async (acc, val) => {
      const targetNotionPage = await prisma.notionPage.findFirst({
        where: { sourceId: val.targetSourceId },
      });

      if (!targetNotionPage) {
        return [...(await acc), val];
      }

      return acc;
    },
    Promise.resolve([]) as Promise<
      {
        author: string;
        targetSourceCoverUrl: string | null;
        targetSourceId: string;
        title: string;
      }[]
    >
  );

  const NOTION_API_KEY = process.env["NOTION_API_KEY"]!;
  const NOTION_BOOKS_DATABASE_ID = process.env["NOTION_BOOKS_DATABASE_ID"]!;

  const notionClient = new Client({ auth: NOTION_API_KEY });

  if (!!notionPagesToCreate.length) {
    console.log("new pages", notionPagesToCreate);
  }

  await Promise.all(
    notionPagesToCreate.map(async (newPage) => {
      try {
        const { id: newNotionPageId } = await notionClient.pages.create({
          icon: newPage.targetSourceCoverUrl
            ? {
                type: "external",
                external: {
                  url: newPage.targetSourceCoverUrl,
                },
              }
            : {
                type: "emoji",
                emoji: "📕",
              },
          ...(!!newPage.targetSourceCoverUrl && {
            cover: {
              type: "external",
              external: { url: newPage.targetSourceCoverUrl },
            },
          }),
          parent: {
            database_id: NOTION_BOOKS_DATABASE_ID,
            type: "database_id",
          },
          properties: {
            Authors: {
              multi_select: newPage.author.split(";").map((author) => {
                return {
                  name: author,
                };
              }),
            },
            Name: {
              title: [
                {
                  text: {
                    content: newPage.title,
                  },
                },
              ],
            },
          },
        });

        await prisma.notionPage.create({
          data: { notionId: newNotionPageId, sourceId: newPage.targetSourceId },
        });
      } catch (e) {
        console.log(e);
      }
    })
  );
};
