# Obsidian Sample Plugin

This is a plugin that let you export some of your notes to an [Astro](https://astro.build/) project.

## How to use

The plugin works by looking for a `draft` frontmatter in your notes. If it's set to `false`, the plugin will export the note to an Astro project.

You can select the folder where the Astro project is located in the plugin settings and you can choose which folders you want the plugin to look for notes ready to be exported.

The export process will create an Astro collection for each folder you selected in the plugin settings. The collection will be named after the `kind` frontmatter property of the notes. 

This project uses Typescript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in Typescript Definition format, which contains TSDoc comments describing what it does.
