# Open WiseR

```sql
SELECT * FROM public."Clipping";
SELECT * FROM public."Source";
SELECT * FROM public."NotionPage";

DELETE FROM public."Clipping";
DELETE FROM public."Source";
DELETE FROM public."NotionPage";
```

## Goals

- Be able to run this in Docker container to monitor a provided directory for changes.
  - Path to monitor will be an environment variable inside of the container.
  - All the API keys will be set during the container build process.
- Some kind of automated clipping creator to make testing a little bit easier.

### Cover Links

[Weapons of Math Destruction: Cover](https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1456091964l/28186015.jpg)

### Refactor notes

- Export single Notion client.
- Await Promise all creation of a new page does not work on subsequent runs.
