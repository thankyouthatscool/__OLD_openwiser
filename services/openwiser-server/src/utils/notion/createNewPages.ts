import { notionClient, prisma } from "../index.js";

const NOTION_BOOKS_DATABASE_ID = process.env["NOTION_BOOKS_DATABASE_ID"]!;

export const createNewPages = async (
  sources: {
    author: string;
    id: string;
    title: string;
  }[]
) => {
  await Promise.all(
    sources.map(async ({ author, id, title }) => {
      const { id: newPageId } = await notionClient.pages.create({
        parent: { database_id: NOTION_BOOKS_DATABASE_ID, type: "database_id" },
        properties: {
          Authors: {
            multi_select: author.split(";").map((author) => {
              return {
                name: author,
              };
            }),
          },
          Created: { date: { start: new Date(Date.now()).toISOString() } },
          Name: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
          Category: { select: { name: "Book" } },
        },
      });

      await prisma.notionPage.create({
        data: {
          notionId: newPageId,
          sourceId: id,
        },
      });
    })
  );
};
