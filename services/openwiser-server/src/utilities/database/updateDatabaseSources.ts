import { parseTitle, prisma } from "..";

export interface LocalSource {
  author: string;
  id: string;
  title: string;
}

export const updateDatabaseSources = async (sources: string[]) => {
  const newSources = await sources.reduce(async (acc, val) => {
    const { author, title } = parseTitle(val);

    const targetSource = await prisma.source.findFirst({
      where: { author, title },
    });

    if (!targetSource) {
      const { id } = await prisma.source.create({
        data: { author, title, type: "book" },
      });

      return [...(await acc), { author, id, title }];
    } else {
      return [...(await acc)];
    }
  }, Promise.resolve([]) as Promise<LocalSource[]>);

  return newSources;
};
