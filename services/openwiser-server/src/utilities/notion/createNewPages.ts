import { LocalSource, notionClient, prisma } from "..";

const NOTION_BOOKS_DATABASE_ID = process.env["NOTION_BOOKS_DATABASE_ID"]!;

export const createNewPages = async (newSources: LocalSource[]) => {
  await Promise.all(
    newSources.map(async ({ author, id, title }) => {
      const sourceClippings = await prisma.clipping.findMany({
        where: { sourceId: id },
      });

      const { id: notionId } = await notionClient.pages.create({
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
          Category: { select: { name: "Book" } },
          Highlights: { number: sourceClippings.length },
          Name: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
        },
      });

      await prisma.notionPage.create({ data: { notionId, sourceId: id } });
    })
  );
};
