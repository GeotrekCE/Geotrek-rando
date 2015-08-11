=========
CHANGELOG
=========

2.1.0 (2015-08-10)
------------------
**New Features**

- Changed configuration method allowing to override only what is needed and offerring easier customisation and maintainability.
- New warning module allowing users to send a message to Geotrek Admin.

**How to update**

Because of the new configuration system, few files had their contents and names changed.
You will need to:

**Backup your old configs and custom files**

**Update your repository (either using git or downloading an archive)**


**Update your config**

- go to **src/app/config** folder
- duplicate the **settings.default.json** file and rename it **settings.custom.json**
- in this file **settings.custom.json** you need to change variables according to your old file **config.js**
- remove all the variables that are not different from the default file you've copied
- remove your old **configs.js** file


**Update your style config**

- go to **src/app/config/styles** folder
- rename your **_config.scss** to **_config-custom.scss**


**Update your style override**

- go to **src/app/custom/styles**
- remove **_custom.scss** file if it exists


**Update your languages customisation**

- go to **src/app/translation/po**
- you should see folders for each lang and your old **lang-custom.po** files
- put your old **lang-custom.po** files in respective folder (ex: **fr-custom.po** goes into the **fr** folder)


2.0.0 (2015-07-20)
------------------

**Initial release of v2**
