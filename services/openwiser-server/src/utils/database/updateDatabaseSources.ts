import { Prisma } from "@prisma/client";
import { parseTitle, prisma } from "../index.js";

export const updateDatabaseSources = async (sources: string[]) => {
  const newSources = await sources.reduce(async (acc, val) => {
    const { author, title } = parseTitle(val);

    try {
      const existingSource = await prisma.source.findFirst({
        where: { author, title },
      });

      if (!existingSource) {
        return [...(await acc), val];
      }
    } catch (e) {
      console.log(e);
    }

    return acc;
  }, Promise.resolve([]) as Promise<string[]>);

  const newSourcesMap = newSources.map((newSource) => {
    const { author, title } = parseTitle(newSource);

    return { author, title };
  });

  const newSourcesSaveRes = newSourcesMap.reduce(
    async (acc, { author, title }) => {
      try {
        const { id, coverUrl } = await prisma.source.create({
          data: { author, title, type: "book" },
        });

        return [...(await acc), { author, coverUrl, id, title }];
      } catch (e) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
          console.log(e);
        }

        return await acc;
      }
    },
    Promise.resolve([]) as Promise<
      { author: string; id: string; title: string }[]
    >
  );

  return newSourcesSaveRes;
};
