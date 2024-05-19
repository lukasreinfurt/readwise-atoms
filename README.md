# Readwise Atoms

Readwise Atoms is an unofficial plugin that synchronizes your Readwise highlights to your Obsidian Vault.
It does so in an atomic fashion, meaning it creates a new note for each of your Readwise highlights.
This is the main difference to the other existing Readwise plugins (see [alternatives](#alternatives)).

Note: This plugin requires a subscription to Readwise.

## Features

- **Automatic synchronization:** The plugin sychronizes your Readwise highlights each time Obsidian starts.
- **Manual synchronization:** You can trigger the synchronization any time manually via a command.
- **Atomic highlight notes:** The plugin creates an individual note for each Readwise highlight.
- **Optional index notes:** The plugin can create an index note for each Readwise document.
  The index note can aggregate and link back to all the document's highlight notes, and the highlight notes can also link back to the index note.
- **Customizable folder structure:** You can have a flat file structure or nest your highlight notes into folders by document type, title, author, or any combination of the metadata provided by Readwise.
  It's all customizable with templates.
- **Customizable file content:** You can control the frontmatter and content of the highlight and index notes with templates.
- **Supports rate limiting:** The Readwise API uses rate limiting when too many highlights are requested in a short amount of time.
  This plugin can handle these rate limits.
- **Incremental updates:** This plugin uses incremental updates after the first synchronization is complete.
  Future sycnronizations will only contain new changes and will thus be faster.

## Setup

1. Install and activate the plugin as described [here](https://help.obsidian.md/Extending+Obsidian/Community+plugins#Install+a+community+plugin)
2. Open the Readwise Atoms settings page and enter your Readwise token
3. Adjust the templates to your liking (see [templates](#templates))
4. Activate automatic synchronization and/or run the sync command

## Usage

If you activated the automatic synchronization option, the plugin will do it's job on its own every time you start Obsidian.

Additionally, you can trigger the following commands via the command palette:

- **Sync**: Synchronizes all new or changed highlights since the last synchronization
- **Resync**: Synchronize all highlights again, regardless of the last syncronization

## Templates

Templates control where in your Obsidian Vault this plugin will store your Readwise highlights and how the content of these files will look like.

All templates use the [handlebars](https://handlebarsjs.com/guide/#simple-expressions) templating language.

Note that handlebars HTML escapes values inserted with double-stash expressions like `{{ this }}`.
Use tripe-stash expressions like `{{{ this }}}` wherever you want to insert text as is.
You can find more information [here](https://handlebarsjs.com/guide/#html-escaping).

Templates have access to the Readwise metadata of the currently processed highlight and/or its corresponding document, such as: `book.title`, `book.author`, `book.highlights`, `highlight.id`, `highlight.text`, etc.
You can find more about all options in the [Readwise api documentation](https://readwise.io/api_deets) in the highlight export response example.

There are four templates you can modify:

### Index path template

An index file can be created for each document that is imported from Readwise.
This template controls where these files will be created and how they will be named.

For example, when set to `Readwise Atoms/{{{book.author}}} - {{{book.title}}}/index.md`, all index files will be named `index.md` and will be placed in the `Readwise Atoms` folder in your Vault, in a subfolder named after the documents's author and title, for example `Readwise Atoms/Steph Ango - File Over App/index.md`

Leave this template empty if you don't want to create index files.

### Index file template

This template controls the content of the index files.
It can be used to link to all highlights from the document or list any other metadata that you might want to see here.

For example, when the template is set to...

```handlebars
---
title: {{{book.title}}}
author: {{{book.author}}}
---

## Quotes

{{#each book.highlights}}
  ![[{{{id}}}]]
{{/each}}
```

...a resulting index file with one linked highlight would look like this:

```markdown
---
title: File Over App
author: Steph Ango
---

## Quotes

![[695837677]]

```

### Highlight path template

A highlight file is created for each highlight that is imported from Readwise.
This template controls where these files will be created and how they will be named.

For example, when set to `Readwise Atoms/{{{book.author}}} - {{{book.title}}}/quotes/{{{highlight.id}}}.md`, all highlight files will be named after the highlight id and will be placed in the `Readwise Atoms` folder in your Vault, in a subfolder named after the document's author and title, in a subsubfolder called `quotes`, for example `Readwise Atoms/Steph Ango - File Over App/quotes/695837677.md`

Note that the location of the highlight files could be independent of the index files.
The resulting folder structure is totally up to you.

### Highlight file template

This template controls the content of the highlight files.
It can be used to show the highlight text, list any other highlight metadata, and link back to the corresponding index note.

For example, when the template is set to...

```handlebars
---
id: {{{ highlight.id }}}
source: '[[{{{book.author}}} - {{{book.title}}}/index]]'
---

{{{ highlight.text }}}
```

...a resulting highlight file that links back to its corresponding index file would look like this:

```markdown
---
id: 695837677
source: '[[Steph Ango - File Over App/index]]'
---

*File over app* is a philosophy: if you want to create digital artifacts that last, they must be files you can control, in formats that are easy to retrieve and read. Use tools that give you this freedom
```

## Alternatives

There are currently three alternative plugins for synching Readwise highlights to Obsidian:

1. [Readwise Official](https://github.com/readwiseio/obsidian-readwise)

2. [Readwise Community](https://github.com/renehernandez/obsidian-readwise)

3. [Readwise Mirror](https://github.com/jsonMartin/readwise-mirror)

None of them supports atomic highlights. If you don't need or want atomic highlights, I suggest using one of these.
