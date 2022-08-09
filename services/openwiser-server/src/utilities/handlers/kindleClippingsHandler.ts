import chalk from "chalk";

import {
  createNewPages,
  kindleClippingsParer,
  prisma,
  normalizeClippings,
  updateDatabaseClippings,
  updateDatabaseSources,
  updatePageClippings,
  validatePages,
} from "..";

export const handleKindleClippings = async (path: string) => {
  // await prisma.notionPage.deleteMany({});
  // await prisma.clipping.deleteMany({});
  // await prisma.source.deleteMany({});

  const formattedClippings = kindleClippingsParer(path);

  console.log(
    chalk.bold(`${chalk.blue(formattedClippings.length)} Clippings Parsed`)
  );

  const normalizedClippings = normalizeClippings(formattedClippings);

  // console.log("Clippings", normalizedClippings);

  const sources = Object.keys(normalizedClippings);

  // console.log("Sources", sources, sources.length);

  const newSources = await updateDatabaseSources(sources);

  console.log("New Sources", newSources, newSources.length);

  const newClippings = await updateDatabaseClippings(formattedClippings);

  console.log("New Clippings", newClippings, newClippings.length);

  await validatePages();

  await createNewPages(newSources);
  await updatePageClippings(newClippings);
};
