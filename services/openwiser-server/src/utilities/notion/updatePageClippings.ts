import { LocalClipping, notionClient, prisma } from "..";

export const updatePageClippings = async (newClippings: LocalClipping[]) => {
  const normalized = newClippings.reduce((acc, val) => {
    const { sourceId, ...rest } = val;

    if (acc[sourceId]) {
      return { ...acc, [sourceId]: [...acc[sourceId], rest] };
    } else {
      return { ...acc, [sourceId]: [rest] };
    }
  }, {});

  const sourcesToUpdate = Object.keys(normalized);

  await Promise.all(
    sourcesToUpdate.map(async (source) => {
      const { notionId } = await prisma.notionPage.findFirstOrThrow({
        where: { sourceId: source },
      });

      const sourceClippings = normalized[source];

      const childrenArray = sourceClippings.reduce(
        (acc, { content, date, location, page, type }) => {
          return [
            ...acc,
            {
              callout: {
                color:
                  type === "highlight"
                    ? "yellow_background"
                    : "green_background",
                icon: { emoji: "🔖" },
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
              paragraph: { rich_text: [{ text: { content } }] },
            },
          ];
        },
        [] as {}[]
      );

      await notionClient.blocks.children.append({
        block_id: notionId,
        children: childrenArray,
      });
    })
  );
};
