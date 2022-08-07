import { Client } from "@notionhq/client";

import { prisma } from "./index.js";
import { NormalizedClippingsObject, parseTitle } from "../parsers/index.js";

export const updateKindleClippings = async (
  normalizedClippings: NormalizedClippingsObject
) => {
  const withSourceId = await Object.keys(normalizedClippings).reduce(
    async (acc, val) => {
      const sourceId = (
        await prisma.source.findFirst({
          where: { title: parseTitle(val).title },
        })
      )?.id;

      return {
        ...(await acc),
        [val]: normalizedClippings[val].map((clipping) => {
          return { ...clipping, sourceId };
        }),
      };
    },
    {} as Promise<NormalizedClippingsObject>
  );

  const clippings = Object.keys(withSourceId).reduce(
    (acc, val) => {
      return [...acc, ...withSourceId[val]];
    },
    [] as {
      content: string;
      date: string;
      location: string;
      page: string;
      type: string;
      sourceId?: string;
    }[]
  );

  const newClippings = await clippings.reduce(async (acc, val) => {
    const targetClipping = await prisma.clipping.findFirst({
      where: {
        content: val.content,
        sourceId: val.sourceId,
      },
    });

    if (!!targetClipping) {
      return await acc;
    } else {
      return [...(await acc), val];
    }
  }, Promise.resolve([]) as Promise<{}[]>);

  await prisma.clipping.createMany({
    data: clippings.map((clipping) => {
      return {
        content: clipping.content,
        date: new Date(clipping.date).toISOString(),
        location: clipping.location,
        page: clipping.page,
        type: clipping.type,
        sourceId: clipping.sourceId!,
      };
    }),
    skipDuplicates: true,
  });

  return newClippings;
};

export const insertClippingsIntoNotionPages = async (newClippings: {}[]) => {
  const normalizedOnSourceId = newClippings.reduce((acc, val) => {
    const { sourceId, ...rest } = val;

    if (acc[sourceId]) {
      return { ...acc, [sourceId]: [...acc[sourceId], rest] };
    } else {
      return { ...acc, [sourceId]: [rest] };
    }
  }, {} as { [key: string]: {}[] });

  const NOTION_API_KEY = process.env["NOTION_API_KEY"]!;

  const notionClient = new Client({ auth: NOTION_API_KEY });

  await Promise.all(
    Object.keys(normalizedOnSourceId).map(async (sourceId) => {
      const targetNotionPage = await prisma.notionPage.findFirstOrThrow({
        where: { sourceId },
      });

      console.log(targetNotionPage.notionId);

      const pageContent = normalizedOnSourceId[sourceId];

      const childrenArray = pageContent.reduce(
        (acc, { content, date, location, page }) => {
          return [
            ...acc,
            {
              callout: {
                color: "green_background",
                icon: {
                  emoji: "🔖",
                },
                rich_text: [
                  {
                    text: {
                      content: `Added on - ${date}\nPage ${page} | Location ${location}`,
                    },
                  },
                ],
              },
            },
            {
              paragraph: {
                rich_text: [
                  {
                    text: {
                      content,
                    },
                  },
                ],
              },
            },
          ];
        },
        [] as {}[]
      );

      await notionClient.blocks.children.append({
        block_id: targetNotionPage.notionId,
        children: childrenArray,
      });
    })
  );
};
