import json

from django.conf import settings
from django.template.loader import render_to_string

from rando.core.management.commands.sync_content import InputFile, reroot, cprint
from rando import logger
from rando.trekking import models


class JsonInputFile(InputFile):

    def serialize_json(self, data):
        """
        Serializes JSON with less precision.
        """
        backup_encoder = getattr(json.encoder, 'c_make_encoder', None)
        backup_repr = json.encoder.FLOAT_REPR
        json.encoder.c_make_encoder = None
        json.encoder.FLOAT_REPR = lambda o: format(o, '.%sf' % settings.COORDS_FORMAT_PRECISION)
        serialized = json.dumps(data)
        json.encoder.FLOAT_REPR = backup_repr
        json.encoder.c_make_encoder = backup_encoder
        return serialized


class POIsInputFile(JsonInputFile):

    def content(self):
        content = self.reply.json()
        if content is None:
            return super(POIsInputFile, self).content()

        features = []
        for feature in content['features']:
            properties = feature['properties']

            poitype_value = properties.pop('type')
            thumbnail_values = properties.pop('thumbnail')
            pictures_values = properties.pop('pictures')

            properties['type'] = reroot(poitype_value, attr='pictogram')
            properties['thumbnail'] = reroot(thumbnail_values)
            properties['pictures'] = reroot(pictures_values, attr='url')

            feature['properties'] = properties
            features.append(feature)

        content['features'] = features
        return self.serialize_json(content)


class TrekInputFile(JsonInputFile):

    def content(self):
        content = self.reply.json()
        if content is None:
            return super(TrekInputFile, self).content()

        content['thumbnail'] = reroot(content['thumbnail'])
        content['pictures'] = reroot(content['pictures'], attr='url')
        content['themes'] = reroot(content['themes'], attr='pictogram')
        content['usages'] = reroot(content['usages'], attr='pictogram')

        content['difficulty'] = reroot(content['difficulty'], attr='pictogram')
        content['route'] = reroot(content['route'], attr='pictogram')
        content['networks'] = reroot(content['networks'], attr='pictogram')

        wl = []
        for w in content['web_links']:
            if w.get('category'):  # Safety for uncategorized links
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


class InformationDeskInputFile(JsonInputFile):

    def content(self):
        content = self.reply.json()
        if content is None:
            return super(InformationDeskInputFile, self).content()

        features = []
        for feature in content['features']:
            properties = feature['properties']
            properties['photo_url'] = reroot(properties['photo_url'])
            properties['html'] = render_to_string('trekking/_information_desk.html',
                                                  {'desk': properties})
            feature['properties'] = properties
            features.append(feature)
        content['features'] = features
        return self.serialize_json(content)


class AttachmentInputFile(JsonInputFile):
    def __init__(self, *args, **kwargs):
        super(AttachmentInputFile, self).__init__(*args, **kwargs)

    def content(self):
        content = self.reply.json()
        if content is None:
            return super(AttachmentInputFile, self).content()

        # Filter attachments, mainly by mimetype
        filtered = []
        for attachment in content:
            # Images come through pictures list already
            if attachment['is_image']:
                continue
            attachment['url'] = reroot(attachment['url'])

            # Mimetype check (either by first part or complete)
            main, category = attachment['mimetype']
            mimetype = '%s/%s' % (main, category)
            allowed = settings.FILELIST_MIMETYPES

            if main in allowed or mimetype in allowed:
                filtered.append(attachment)

        return self.serialize_json(filtered)


class TrekListInputFile(JsonInputFile):

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
            detailsource = models.Trek.detailsource.format(pk=pk)
            detailpath = models.Trek.detailpath.format(pk=pk)
            detailfile = TrekInputFile(url=detailsource, store=detailpath, **self.initkwargs)
            detailfile.pull()
            detail = json.loads(detailfile.content())
            properties.update(detail)

            # Remove rooturl from relative URLs
            relative_props = ['altimetric_profile', 'elevation_area_url', 'gpx', 'kml',
                'map_image_url', 'printable', 'poi_layer', 'information_desk_layer']
            for k in relative_props:
                properties[k] = properties[k].replace(self.client.rooturl, '') if properties.get(k) else properties.get(k)

            # Reroot information desks photos
            properties['information_desks'] = reroot(properties['information_desks'], attr='photo_url')

            # Download attachments list file
            url = reroot(properties['filelist_url'])
            destination = models.AttachmentFile.filepath.format(objectname='trek', object__pk=pk)
            # Store destination as new official url (e.g. for Geotrek mobile)
            properties['filelist_url'] = destination
            f = AttachmentInputFile(url, store=destination, **self.initkwargs)
            f.pull()

            # Add POIs information in list, useful for textual search
            f = POIsInputFile(models.TrekPOIs.filepath.format(trek__pk=pk), **self.initkwargs)
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
    for language in languages[:1]:
        inputkwlang = dict(language=language, **input_kwargs)

        TrekListInputFile(**inputkwlang).pull()

        for trek in models.Trek.tmp_objects.filter(language=language).all():
            InputFile(trek.gpx, **inputkwlang).pull_if_modified()
            InputFile(trek.kml, **inputkwlang).pull_if_modified()
            InformationDeskInputFile(trek.information_desk_layer, **inputkwlang).pull_if_modified()

            if settings.PRINT_ENABLED:
                InputFile(trek.printable, **inputkwlang).pull_if_modified()

        JsonInputFile(url=models.POI.filesource, store=models.POI.filepath, **inputkwlang).pull()


    # Fetch media only once, since they do not depend on language
    for trek in models.Trek.tmp_objects.filter(language=settings.LANGUAGE_CODE).all():
        InputFile(trek.map_image_url, **input_kwargs).pull_if_modified()
        InputFile(trek.altimetric_profile, **input_kwargs).pull_if_modified()

        if trek.thumbnail:
            InputFile(trek.thumbnail, **input_kwargs).pull_if_modified()
        for picture in trek.pictures:
            InputFile(picture.url, **input_kwargs).pull_if_modified()

        for theme in trek.themes:
            InputFile(theme.pictogram, **input_kwargs).pull_if_modified()
        for usage in trek.usages:
            InputFile(usage.pictogram, **input_kwargs).pull_if_modified()
        for network in trek.networks:
            if network.pictogram:
                InputFile(network.pictogram, **input_kwargs).pull_if_modified()

        if trek.difficulty and trek.difficulty.pictogram:
            InputFile(trek.difficulty.pictogram, **input_kwargs).pull_if_modified()
        if trek.route and trek.route.pictogram:
            InputFile(trek.route.pictogram, **input_kwargs).pull_if_modified()

        for weblink in trek.web_links:
            if weblink.category:
                InputFile(weblink.category.pictogram, **input_kwargs).pull_if_modified()
        for poi in models.TrekPOIs.tmp_objects.filter(trek__pk=trek.pk,
                                                      language=settings.LANGUAGE_CODE).all():
            if poi.properties.thumbnail:
                InputFile(poi.properties.thumbnail, **input_kwargs).pull_if_modified()
            for picture in poi.properties.pictures:
                InputFile(picture.url, **input_kwargs).pull_if_modified()
            InputFile(poi.properties.type.pictogram, **input_kwargs).pull_if_modified()

        for desk in trek.information_desks:
            if desk and desk.get('photo_url', ''):
                InputFile(desk.photo_url, **input_kwargs).pull_if_modified()

        #
        # Fetch attachments
        if settings.FILELIST_ENABLED:
            attachments = models.AttachmentFile.tmp_objects.filter(objectname='trek',
                                                                   object__pk=trek.pk,
                                                                   language=settings.LANGUAGE_CODE)
            for attachment in attachments.all():
                InputFile(attachment.url, **input_kwargs).pull_if_modified()
