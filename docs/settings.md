# Geotrek-rando documentation

‹ Back to [README](README.md)

## Settings & customization

### Settings

There are two files in Geotrek-rando managing client side settings:

#### settings.custom.json

> This file should remain a valid [JSON][] file.
> Remember to check its validity each time you alter it.

In directory `src/app/config/` there is a file named `settings.default.json` that contains the default setup. Each option of it can be copied to another one: `settings.custom.json`.

Both files are always loaded by the app, but every rules from the second one will override those from first one.

**NB:** You should never modify `settings.default.json` as it will be overwritten as soon as you will update the source code. Every single setting you want to change should be put in `settings.custom.json`.

_See [JSON settings][] for more details about each available options._

#### \_config-custom.scss

> This file should remain a valid [SCSS][] file.
> Remember to check its validity each time you alter it.

In directory `src/app/config/styles`, as for `settings.*.json` files, there is `_config-default.scss` that should never be modify. But any setting you want to change should be added to `_config-custom.scss`.

**Caution:** Default options use a `!default` switch for each parameter. You do not have to copy this switch when adding your own options to `_config-custom.scss` file.

_See [SCSS settings][] for more details about each available options._

### Customization

Beyond settings, you also have ways to customize look & feel but also create new behaviors.

#### Templates

By creating HTML files in `src/app/custom/templates` and [enabling there use in settings](settings-custom-json.md#custom_templates), you have the possibility to use your own markup for some elements of the interface. For example :

* `custom-header.html`
* `custom-home.html`

The filename does not really matter as far as the file stays in this directory.

#### Styles

By creating [SCSS][] files in `src/app/custom/styles` you have the ability to include as many CSS rules as you need.
Every files you create in this directory will be merged as one during [built process](building.md).

**Note:** There are two reserved filename for files in this directory : Do not name your files `_customisation.scss` or `_empty.scss`.
We suggest you to create a file for each part you alter. (e.g. `custom-menu.scss` or `custom-detail-page.scss`)

#### Behaviors

Having your own behavior available for your templates is possible through three files:

* `controller.js`
* `directive.js`
* `service.js`

Those files have to be created in `src/app/custom/`.
You may follow the example files (`*.example`) to use the right structure.

<!-- Internal links -->

[JSON settings]: settings-custom-json.md
[SCSS settings]: config-custom-scss.md

<!-- External links -->

[JSON]: http://www.json.org/
[SCSS]: http://sass-lang.com/
