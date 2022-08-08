import { Prisma } from "@prisma/client";

import {
  NormalizedClippingsArray,
  NormalizedClippingsObject,
  parseTitle,
  prisma,
} from "./../index.js";

export interface NormalizedClippingsArrayWithId
  extends NormalizedClippingsArray {
  coverUrl: string | null;
  sourceId: string | undefined;
}

export const updateDatabaseClippings = async (
  normalizedClippings: NormalizedClippingsObject
) => {
  const withSourceId = await Object.keys(normalizedClippings).reduce(
    async (acc, val) => {
      const { author, title } = parseTitle(val);

      try {
        const { id, coverUrl } = await prisma.source.findFirstOrThrow({
          where: { author, title },
        });

        return {
          ...(await acc),
          [val]: normalizedClippings[val].map((clipping) => {
            return { ...clipping, coverUrl, sourceId: id };
          }),
        };
      } catch {
        return acc;
      }
    },
    {} as Promise<{ [key: string]: NormalizedClippingsArrayWithId[] }>
  );

  const clippingsArray = Object.keys(withSourceId).reduce((acc, val) => {
    return [...acc, ...withSourceId[val]];
  }, [] as NormalizedClippingsArrayWithId[]);

  const newClippings = await clippingsArray.reduce(async (acc, val) => {
    const { content, coverUrl, date, location, page, sourceId, type } = val;
    try {
      const targetClipping = await prisma.clipping.findFirst({
        where: { content, sourceId },
      });

      if (!targetClipping) {
        await prisma.clipping.create({
          data: {
            content,
            coverUrl,
            date: new Date(date).toISOString(),
            location,
            page,
            sourceId: sourceId!,
            type,
          },
        });

        return [...(await acc), val];
      } else {
        return [...(await acc)];
      }
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
        console.log(e);
      }

      return [...(await acc)];
    }
  }, Promise.resolve([]) as Promise<NormalizedClippingsArray[]>);

  return newClippings;
};
