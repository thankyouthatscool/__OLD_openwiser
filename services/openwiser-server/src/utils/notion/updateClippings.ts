import {
  NormalizedClippingsArrayWithId,
  notionClient,
  prisma,
} from "../index.js";

export const updateClippings = async (
  clip: NormalizedClippingsArrayWithId[]
) => {
  const normalizedOnSourceId = clip.reduce((acc, val) => {
    const { sourceId, ...rest } = val;

    if (acc[sourceId!]) {
      return {
        ...acc,
        [sourceId!]: [...acc[sourceId!], { ...rest, sourceId }],
      };
    } else {
      return { ...acc, [sourceId!]: [{ ...rest, sourceId }] };
    }
  }, {} as { [key: string]: NormalizedClippingsArrayWithId[] });

  await Promise.all(
    Object.keys(normalizedOnSourceId).map(async (sourceId) => {
      try {
        const targetNotionPage = await prisma.notionPage.findFirst({
          where: { sourceId },
        });

        if (!!targetNotionPage) {
          const sourceContent = normalizedOnSourceId[sourceId];

          const childrenArray = sourceContent.reduce(
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
            //@ts-ignore
            children: childrenArray,
          });
        }
      } catch (e) {
        console.log(e);
      }
    })
  );
};
