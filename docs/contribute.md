# Geotrek-rando documentation

‹ Back to [README](README.md)

## Contribute

### Workflow

#### Git

**master** is the main developpement branch, but **don't** commit directly into it, and **don't** merge it back into your development branch.

Always start by creating your own fork of the repository
(`origin` should point to your fork, and `upstream` should be a reference to main Geotrek-rando repository).

For each development you do, create a dedicated branch from the tip of **master**, and **rebase** your branch before creating your [pull request](https://help.github.com/articles/creating-a-pull-request/) (and each time you edit it).

<!--
@TODO:
    Step by step explanation of how to do a commit / pull request / referencing an issue
-->

### Coding conventions / styles

#### Javascript

In the root directory of the project is a file named `.eslintrc.js` which gives the main rules that all javascript files have to follow.

But here comes some common rules :
* Use 4 space indents
* Always use `strict mode`
* Use single quotes `'` for strings
* Always use strict equality operators (`====` & `!==`)
* Always put curly braces around blocks (loops and conditionals)
* Line break immediately after opening curly braces, and before closing it.

#### SCSS

* Use 4 space indents
* Line break immediately after opening curly braces, and before closing it.
