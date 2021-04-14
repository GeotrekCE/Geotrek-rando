# Geotrek-rando documentation

‹ Back to [Settings & customization](settings.md)

## \_configuration.scss

This file allows you to set colors for trek practices and touristic content categories.

See [_configuration.default.scss](/src/app/config/styles/_configuration.default.scss) default file to list available vars.

You can also add as many variable you need for theming.

## Add styles

The file named `custom/_customisation.scss` allows you to write as many [SCSS](https://sass-lang.com/) files as you need.

If you want to split your styles in multiple files, you have to use the
SCSS `@import 'filename'` rule to include other `.scss` files.

For exemple, you can add CSS by adding a `custom/styles/_custom-overrides.scss` file, then importing it in `custom/customisation.scss` with:

```css
@import "styles/custom-header";
```

_Note: `customisation.scss` must remain directly in `custom/` directory but the files you `@import` in it may be wherever you want._

## Tips

### Change results list background color

```css
.resultsview-pane {
    background-color: #3a3a3a;
}
```

### Change path weight

```css
.leaflet-overlay-pane svg path {
    stroke-width: 6;
}
```
