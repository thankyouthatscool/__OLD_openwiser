import chalk from "chalk";

import { notionClient, prisma } from "../index.js";

const NOTION_BOOKS_DATABASE_ID = process.env["NOTION_BOOKS_DATABASE_ID"]!;

export const updatePages = async () => {
  try {
    await checkMissingNotionPages();

    const myNotionPages = await prisma.notionPage.findMany({
      include: { source: true },
    });

    const withCoverUrl = myNotionPages.filter((page) => page.source.coverUrl);

    await Promise.all(
      withCoverUrl.map(async (page) => {
        await notionClient.pages.update({
          cover: { type: "external", external: { url: page.source.coverUrl! } },
          icon: { type: "external", external: { url: page.source.coverUrl! } },
          page_id: page.notionId,
        });
      })
    );
  } catch (e) {
    console.log("Error updating pages");
  }
};

const checkMissingNotionPages = async () => {
  await ratifyMismatchedDatabases();

  console.log(chalk.blue("Checking for Missing Notion pages."));

  const sources = await prisma.source.findMany({
    include: { notionPage: true },
  });

  const sourcesWithNoNotionPage = sources.filter(
    (source) => !source.notionPage
  );

  if (!!sourcesWithNoNotionPage.length) {
    console.log(`There are ${sourcesWithNoNotionPage.length} missing Pages.\n`);
  } else {
    console.log(chalk.green("All Good.\n"));
  }

  await Promise.all(
    sourcesWithNoNotionPage.map(async (source) => {
      try {
        const clippingsToUpdate = await prisma.clipping.findMany({
          where: { sourceId: source.id },
        });

        const { id: newNotionPageId } = await notionClient.pages.create({
          ...(!!source.coverUrl && {
            cover: { external: { url: source.coverUrl }, type: "external" },
          }),
          icon: !!source.coverUrl
            ? { external: { url: source.coverUrl }, type: "external" }
            : { emoji: "📕", type: "emoji" },
          parent: {
            database_id: NOTION_BOOKS_DATABASE_ID,
            type: "database_id",
          },
          properties: {
            Authors: {
              multi_select: source.author.split(";").map((author) => {
                return { name: author };
              }),
            },
            Created: {
              date: { start: new Date(Date.now()).toISOString() },
            },
            Highlights: { number: clippingsToUpdate.length },
            Name: { title: [{ text: { content: source.title } }] },
            Category: { select: { name: "Book" } },
          },
        });

        await prisma.notionPage.create({
          data: { notionId: newNotionPageId, sourceId: source.id },
        });

        const childrenArray = clippingsToUpdate.reduce(
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
          block_id: newNotionPageId,
          //@ts-ignore
          children: childrenArray,
        });
      } catch (e) {
        console.log(e);
      }
    })
  );
};

const ratifyMismatchedDatabases = async () => {
  console.log(chalk.blue("Checking for Database Mismatches."));

  const existingNotionPages = (
    await notionClient.databases.query({
      database_id: NOTION_BOOKS_DATABASE_ID,
    })
  ).results
    .filter((result) => result.object === "page")
    .map((result) => result.id);

  const missingNotionPages = await prisma.notionPage.findMany({
    where: { notionId: { notIn: existingNotionPages } },
    include: { source: true },
  });

  if (!!missingNotionPages.length) {
    console.log(
      chalk.yellow(
        `Updating ${missingNotionPages.length} Missing Notion Page${
          missingNotionPages.length > 1 ? "s" : ""
        }.\n`
      )
    );
  } else {
    console.log(chalk.green("No Missing Pages.\n"));
  }

  await Promise.all(
    missingNotionPages.map(async (missingPage) => {
      const clippingsToUpdate = await prisma.clipping.findMany({
        where: { sourceId: missingPage.source.id },
      });

      const childrenArray = clippingsToUpdate.reduce(
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

      const { id: newNotionPageId } = await notionClient.pages.create({
        ...(!!missingPage.source.coverUrl && {
          cover: {
            external: { url: missingPage.source.coverUrl },
            type: "external",
          },
        }),
        icon: !!missingPage.source.coverUrl
          ? { external: { url: missingPage.source.coverUrl }, type: "external" }
          : { emoji: "📕", type: "emoji" },
        parent: { database_id: NOTION_BOOKS_DATABASE_ID, type: "database_id" },
        properties: {
          Authors: {
            multi_select: missingPage.source.author.split(";").map((author) => {
              return { name: author };
            }),
          },
          Created: { date: { start: new Date(Date.now()).toISOString() } },
          Highlights: { number: clippingsToUpdate.length },
          Name: { title: [{ text: { content: missingPage.source.title } }] },
          Category: { select: { name: "Book" } },
        },
        //@ts-ignore
        children: childrenArray,
      });

      await prisma.notionPage.update({
        data: { notionId: newNotionPageId },
        where: { sourceId: missingPage.sourceId },
      });
    })
  );
};
