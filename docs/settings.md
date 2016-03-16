# Geotrek-rando documentation

‹ Back to [README](README.md)

## Settings & customization

All files you could create or edit have to be put in `custom/` directory at the main root of the project. Any other location will be deleted or override by the build or upgrade processes.

The build process will also create empty files if they don't already exists.

### Settings

There are two files in Geotrek-rando managing client side settings:

#### settings.custom.json

> This file should remain a valid [JSON][] file.
> Remember to check its validity each time you alter it.

In directory `src/app/config/` there is a file named `settings.default.json` that contains the default setup. Each option of it can be copied to another one: `settings.custom.json` located in `custom/` directory.

Both files are always loaded by the app, but every rules from the second one will override those from first one.

_See [JSON settings][] for more details about each available options._

#### \_configuration.scss

> This file should remain a valid [SCSS][] file.
> Remember to check its validity each time you alter it.

In directory `src/app/config/styles` is `_configuration.default.scss` that
should never be modify. But any setting you want to change should be added
to `_configuration.scss` located in `custom/`.

**Caution:** Default options use a `!default` switch for each parameter.
You should not copy this switch when adding your own options to `_configuration.scss` file.

_See [SCSS settings][] for more details about each available options._

### Customization

Beyond settings, you also have ways to customize look & feel but also create new behaviors.

#### Templates

By creating HTML files in `custom/public` and [enabling there use in settings](settings-custom-json.md#custom_templates), you have the possibility
to use your own markup for some elements of the interface. For example :

* `custom-header.html`
* `custom-home.html`

The filename does not really matter as far as `custom/templates` will be used as root directory.

_See [templates settings][] for a complete list of templates you can configure._

#### Styles

The file named `custom/_customisation.scss` allows you to write as many [SCSS]() as you need.

If you want to split your styles in multiple files, you have to use the
SCSS `@import 'filename'` rule to include other `.scss` files.

_Note: `customisation.scss` must remain directly in `custom/` directory but the files you `@import` in it may be wherever you want._

#### Behaviors

Having your own behavior available for your templates is possible through three files:

* `controller.js`
* `directive.js`
* `service.js`

Those files have also to be in `custom/` directory.
You may follow the `src/app/custom/*.example` to use the right structure.

#### Images, fonts and others things

Everything from the `public/` directory is directy served by the web server.
But you **sould not put anything** directly there.
Also, `public/custom` is a symbolic link pointing directy to `custom/public`.
So all elements that you want to be accessible through `http` should be placed in the `custom/public/` directory and would be accessed with the path: `/custom/`. For exemple: `custom/public/my_picture.png` would be accessed by the link `http://my-geotrek-domain.com/custom/my_picture.png`.


<!-- Internal links -->

[JSON settings]: settings-custom-json.md
[SCSS settings]: configuration-scss.md
[templates settings]: custom-templates.md

<!-- External links -->

[JSON]: http://www.json.org/
[SCSS]: http://sass-lang.com/
