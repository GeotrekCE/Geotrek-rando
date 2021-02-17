# Geotrek-rando documentation

‹ Back to [README](README.md)

## Installing NodeJS

We recommand to install NodeJS with [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm#installing-and-updating)

After nvm installation, run:

```commandline
nvm install
```

*For now, NodeJS version used is v6, and we are working to update it*

## Install Geotrek-rando

Download and extract latest release of Geotrek-Rando from [GitHub](https://github.com/GeotrekCE/Geotrek-rando/releases/latest).

_You may also download sources by cloning git repository._

### Install build dependencies

```commandline
cd Geotrek-rando-*
npm install
```

### Launch build task

```commandline
npm run dist
```

It will :
* Create missing config files
* Create the main JavaScript bundle as `dist/public/scripts/rando.js`
* Compile sass files and bundle them in `dist/public/styles/rando.css` and `dist/public/styles/rando-vendors.css`

For automaticly building bundles when editing files, use :

```commandline
npm run watch
```

See [http section](http-server.md) to install with web server.

## Software update

Download and extract the latest release of Geotrek-Rando from GitHub (https://github.com/GeotrekCE/Geotrek-rando/releases).

Before upgrading, READ CAREFULLY the release notes, either from the CHANGES files or online.

```commandline
wget https://github.com/makinacorpus/Geotrek-rando/archive/X.Y.Z.zip
unzip X.Y.Z.zip
```

In order to avoid editing NGINX configuration at each upgrade, you can rename the folders.

```commandline
mv /path/to/application/ /path/to/application.old/
mv /path/to/Geotrek-rando-X.Y.Z/ /path/to/application/
```

Make sure the NGINX virtualhost refers to the folder of this new version. 

Install the new version of the application.

```commandline
cd /path/to/application/
npm install
```

Copy the custom folder of the previous version.

```commandline
cp -aR ../previous-version/custom/ .
```

Launch build task

```commandline
npm run dist
```
