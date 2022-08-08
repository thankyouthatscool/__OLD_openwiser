# Open WiseR

```sql
SELECT * FROM public."Clipping";
SELECT * FROM public."Source";
SELECT * FROM public."NotionPage";

DELETE FROM public."Clipping";
DELETE FROM public."Source";
DELETE FROM public."NotionPage";
```

```json
[
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1471617928l/15096164.jpg",
    "Pines"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1642987905l/57007950.jpg",
    "I'd Like to Play Alone, Please: Essays"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1628856476l/58112555._SY475_.jpg",
    "Before & Laughter: The Funniest Man in the UK’s Genuinely Useful Guide to Life"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1655988385l/40121378.jpg",
    "Atomic Habits: Tiny Changes, Remarkable Results: An Easy & Proven Way to Build Good Habits & Break Bad Ones"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1349614200l/13453029.jpg",
    "Wool - Omnibus Edition"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1658802301l/61722326._SY475_.jpg",
    "Tomorrow, and Tomorrow, and Tomorrow: A novel"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1571889177l/45553812.jpg",
    "Humble Pi: When Math Goes Wrong in the Real World"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1556604137l/34466963._SY475_.jpg",
    "Why We Sleep: Unlocking the Power of Sleep and Dreams"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1581443441l/51181015._SY475_.jpg",
    "The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1569299522l/53056522.jpg",
    "Mediocre: The Dangerous Legacy of White Male America"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1624232683l/39704901._SY475_.jpg",
    "Homo Deus: A Brief History of Tomorrow"
  ],
  [
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1456091964l/28186015.jpg",
    "Weapons of Math Destruction: How Big Data Increases Inequality and Threatens Democracy"
  ]
]
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
