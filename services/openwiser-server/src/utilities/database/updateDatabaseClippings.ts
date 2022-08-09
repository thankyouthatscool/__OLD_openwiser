import { FormattedKindleClipping, parseTitle, prisma } from "..";

export interface LocalClipping extends FormattedKindleClipping {
  id: string;
  sourceId: string;
}

export const updateDatabaseClippings = async (
  formattedClippings: FormattedKindleClipping[]
) => {
  const newClippings = await formattedClippings.reduce(async (acc, val) => {
    const { author, title } = parseTitle(val.source);

    const { id: sourceId } = await prisma.source.findFirstOrThrow({
      where: { author, title },
    });

    const targetClipping = await prisma.clipping.findFirst({
      where: { content: val.content, sourceId },
    });

    if (!targetClipping) {
      const { id } = await prisma.clipping.create({
        data: {
          content: val.content,
          date: new Date(val.date).toISOString(),
          location: val.location,
          page: val.page,
          type: val.type,
          sourceId,
        },
      });

      return [...(await acc), { ...val, id, sourceId }];
    } else {
      return [...(await acc)];
    }
  }, Promise.resolve([]) as Promise<LocalClipping[]>);

  return newClippings;
};
