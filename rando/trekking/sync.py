import json

from django.conf import settings

from rando.core.management.commands.sync_content import InputFile, reroot, cprint
from rando import logger
from rando.trekking import models


class POIsInputFile(InputFile):

    def content(self):
        content = self.reply.json()
        if content is None:
            return super(POIsInputFile, self).content()

        features = []
        for feature in content['features']:
            properties = feature['properties']
            poitype = properties.pop('serializable_type')
            poitype = reroot(poitype, attr='pictogram')
            properties['type'] = poitype
            properties['thumbnail'] = reroot(properties.pop('serializable_thumbnail'))
            properties['pictures'] = reroot(properties.pop('serializable_pictures'), attr='url')
            feature['properties'] = properties
            features.append(feature)
        content['features'] = features
        return self.serialize_json(content)


class TrekInputFile(InputFile):

    def content(self):
        content = self.reply.json()
        if content is None:
            return super(TrekInputFile, self).content()

        content['thumbnail'] = reroot(content['thumbnail'])
        content['pictures'] = reroot(content['pictures'], attr='url')
        content['themes'] = reroot(content['themes'], attr='pictogram')
        content['usages'] = reroot(content['usages'], attr='pictogram')
        wl = []
        for w in content['web_links']:
            w['category'] = reroot(w['category'], attr='pictogram')
            wl.append(w)
        content['web_links'] = wl

        # Remove unpublished treks from related
        content['relationships'] = [r for r in content['relationships'] if r['published']]
        # For presentation purposes
        content['relationships_departure'] = [r for r in content['relationships'] if r['has_common_departure']]
        content['relationships_edge'] = [r for r in content['relationships'] if r['has_common_edge']]
        content['relationships_circuit'] = [r for r in content['relationships'] if r['is_circuit_step']]
        return self.serialize_json(content)


class TrekListInputFile(InputFile):

    def __init__(self, **kwargs):
        super(TrekListInputFile, self).__init__(models.Trek.filepath, **kwargs)
        self.initkwargs = kwargs

    def content(self):
        content = self.reply.json()
        if content is None:
            return super(TrekListInputFile, self).content()

        features = []
        for feature in content['features']:
            properties = feature['properties']
            pk = properties.get('pk', -1)

            # Ignore treks that are not published
            if not properties.get('published', False):
                logger.debug('Trek %s is not published.' % pk)
                continue

            # Ignore treks that are not linestring
            if feature['geometry']['type'].lower() != 'linestring':
                msg = 'Trek %s was ignored (not linestring).' % pk
                cprint(msg, 'red', attrs=['bold'], file=self.stderr)
                continue

            # Fill with detail properties
            detailpath = models.Trek.detailpath.format(pk=pk)
            detailfile = TrekInputFile(detailpath, **self.initkwargs)
            detailfile.pull()
            detail = json.loads(detailfile.content())
            properties.update(detail)

            # Remove rooturl from relative URLs
            for k in ['altimetric_profile', 'elevation_area_url', 'gpx', 'kml', 'map_image_url', 'printable', 'poi_layer']:
                properties[k] = properties[k].replace(self.rooturl, '') if properties.get(k) else properties.get(k)

            # Add POIs information in list, useful for textual search
            f = POIsInputFile(models.POIs.filepath.format(trek__pk=pk), **self.initkwargs)
            f.pull()
            poiscontent = json.loads(f.content())
            poisprops = [poi['properties'] for poi in poiscontent['features']]
            properties['pois'] = [{'name': poiprop['name'],
                                   'description': poiprop['description'],
                                   'type': poiprop['type']['label']}
                                  for poiprop in poisprops]
            feature['properties'] = properties
            features.append(feature)

        content['features'] = features
        return self.serialize_json(content)


def sync_content_trekking(sender, **kwargs):
    server_settings = kwargs['server_settings']
    input_kwargs = kwargs['input_kwargs']

    languages = server_settings.languages.available.keys()
    logger.debug("Languages: %s" % languages)
    for language in languages:
        inputkwlang = dict(language=language, **input_kwargs)

        TrekListInputFile(**inputkwlang).pull()

        for trek in models.Trek.tmp_objects.filter(language=language).all():
            InputFile(trek.properties.gpx, **inputkwlang).pull_if_modified()
            InputFile(trek.properties.kml, **inputkwlang).pull_if_modified()
            if settings.PRINT_ENABLED:
                InputFile(trek.properties.printable, **inputkwlang).pull_if_modified()

    # Fetch media only once, since they do not depend on language
    for trek in models.Trek.tmp_objects.filter(language=settings.LANGUAGE_CODE).all():
        InputFile(trek.properties.map_image_url, **input_kwargs).pull_if_modified()
        InputFile(trek.properties.altimetric_profile, **input_kwargs).pull_if_modified()
        if trek.properties.elevation_area_url:  # Retro-compatibility
            InputFile(trek.properties.elevation_area_url, **input_kwargs).pull_if_modified()

        if trek.properties.thumbnail:
            InputFile(trek.properties.thumbnail, **input_kwargs).pull_if_modified()
        for picture in trek.properties.pictures:
            InputFile(picture.url, **input_kwargs).pull_if_modified()

        for theme in trek.properties.themes:
            InputFile(theme.pictogram, **input_kwargs).pull_if_modified()
        for usage in trek.properties.usages:
            InputFile(usage.pictogram, **input_kwargs).pull_if_modified()
        for weblink in trek.properties.web_links:
            if weblink.category:
                InputFile(weblink.category.pictogram, **input_kwargs).pull_if_modified()
        for poi in models.POIs.tmp_objects.filter(trek__pk=trek.pk,
                                                  language=settings.LANGUAGE_CODE).all():
            if poi.properties.thumbnail:
                InputFile(poi.properties.thumbnail, **input_kwargs).pull_if_modified()
            for picture in poi.properties.pictures:
                InputFile(picture.url, **input_kwargs).pull_if_modified()
            InputFile(poi.properties.type.pictogram, **input_kwargs).pull_if_modified()
