# Geotrek-rando documentation

‹ Back to [Settings & customization](settings.md)

## \_configuration.scss

This file allows you to set colors for trek practices and touristic content categories.

You can also add as many variable you need for theming.

## Add styles

The file named `custom/_customisation.scss` allows you to write as many [SCSS]() as you need.

If you want to split your styles in multiple files, you have to use the
SCSS `@import 'filename'` rule to include other `.scss` files.

_Note: `customisation.scss` must remain directly in `custom/` directory but the files you `@import` in it may be wherever you want._

## Tips

### Change results list background color



### Change path weight

```
.leaflet-overlay-pane svg path {
    stroke-width: 6;
}
```
