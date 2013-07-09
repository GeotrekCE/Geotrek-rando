// JavaScript Document
function TrekFilter()
{
    var self = this;
    self.matching = [];

    this.initEvents = function () {
        $(".theme .filter").unbind('click').on('click', self.filterChanged);
        $(".chosen-select").chosen().change(self.filterChanged);
        $('#search').unbind('keyup').on("keyup", self.filterChanged);
    };

    this.clear = function () {
        localStorage.removeItem('filterState');
        window.location.replace('#');
        $(".theme .filter.active").removeClass('active');
        $(".chosen-select").val('').trigger("liszt:updated");
        self.load();
    };

    this.__saveState = function () {
        var serialized = $.isEmptyObject(self.state) ? '' : JSON.stringify(self.state);
        localStorage.setItem('filterState', serialized);

        // Refresh URL hash, so that users can copy and paste URLs with filters
        var compressed = LZString.compress(serialized);
        window.location.replace('#' + (serialized.length > 0 ? stringToHex(compressed) : ''));
    };

    this.save = function ()
    {
        for (var k in self.state)
            if ($.isEmptyObject(self.state[k]))
                delete self.state[k];

        if ($.isEmptyObject(self.state)) {
            $('#clear-filters').removeClass('active');
        }
        else {
            $('#clear-filters').addClass('active');
        }

        self.matching = [];
        for(var i=0; i<window.treks.features.length; i++) {
            var trek = window.treks.features[i],
                trekid = trek.properties.pk;
            if (self.match(trek)) {
                self.matching.push(trekid);
            }
        }

        this.__saveState();
        $(self).trigger("filterchange", [self.matching]);
    };

    this.__loadState = function () {
        var hash = window.location.hash.slice(1),
            storage = localStorage.getItem('filterState'),
            state = null;

        // First try to load from hash
        try {
            if (hash.length > 0) {
                var hexhash = hexToString(hash);
                state = JSON.parse(LZString.decompress(hexhash));
            }
        }
        catch (err) {}

        // If no filter in hash, look into localStorage
        if (state === null) {
            try {
                state = JSON.parse(storage);
            }
            catch (err) {}
        }
        return state;
    };

    this.load = function () {
        self.state = this.__loadState();
        
        if (!self.state) self.state = {};
        if (!('sliders' in self.state)) {
           self.state['sliders'] = {'time':{}, 'stage':{}, 'den':{}};
        }

        $('#search').val(self.state.search || '');
        for (var category in self.state) {
            for (var filter in self.state[category]) {
                if (filter == 'undefined' || filter === '')
                    continue;
                var value = self.state[category][filter],
                    elem = $("[data-filter='" + category + "'][data-id='" + filter + "']");

                if ($('#' + filter).hasClass('ui-slider')) {
                    var slider = $('#' + filter).data('slider');
                    if (!value.min) value.min = slider.options.min;
                    if (!value.max) value.max = slider.options.max;
                    $('#' + filter).slider('values', 0, value.min);
                    $('#' + filter).slider('values', 1, value.max);
                    if (value.min == slider.options.min && value.max == slider.options.max)
                        delete self.state[category][filter];
                }
                else {
                    if (elem.length === 0 && $('#basic-filters').length > 0) {
                        console.warn('Unknown elem: ' + elem.selector);
                        delete self.state[category][filter];
                    }

                    if (elem.is('input')) {
                        elem.attr('checked', !!value);
                    }
                    else if (elem.is('option')) {
                        if (!!value) elem.attr('selected', 'selected');
                        else elem.removeAttr('selected');
                    }
                    else {
                        if (value === true)
                            elem.addClass('active');
                        else {
                            // Remove false values
                            delete self.state[category][filter];
                            elem.removeClass('active');
                        }
                    }
                }
            }
        }
        self.initEvents();
    };

    this.filterChanged = function (e) {
        var elem = $(e.target).data("filter") ? $(e.target) : $(e.target).parents('.filter'),
            category = $(elem).data("filter");
        if (!(category in self.state)) {
            self.state[category] = {};
        }
        var dataid = $(elem).data("id");

        if ($(elem).is("select")) {
            var values = $(e.target).val();
            self.state[category] = {};
            for (var v in values) {
                self.state[category][values[v]] = true;
            }
        }
        else if ($(elem).attr("id") == 'search') {
            self.state[category] = $(e.target).val();
        }
        else {
            elem.toggleClass('active');
            if (elem.hasClass("active"))
                self.state[category][dataid] = true;
            else
                delete self.state[category][dataid];
        }
        self.save();
    };

    this.sliderChanged = function(minVal, maxVal, name, slider)
    {
        if (!self.state['sliders']) self.state['sliders'] = {};
        if (!(name in self.state['sliders'])) {
            self.state['sliders'][name] = {};
        }
        self.state['sliders'][name]['min'] = minVal;
        self.state['sliders'][name]['max'] = maxVal;
        self.save();
    };

    this.match = function(trek) {
        if (this.matchStage(trek) &&
            this.matchDuration(trek) &&
            this.matchClimb(trek) &&
            this._matchList(trek, 'theme', 'themes') &&
            this._matchList(trek, 'usage', 'usages') &&
            this._matchList(trek, 'district', 'districts') &&
            this._matchList(trek, 'city', 'cities') &&
            this.matchRoute(trek) &&
            this.search(trek))
             return true;
        return false;
    };

    this.matchStage = function (trek) {
        if (!self.state.sliders) return true;
        if (!self.state.sliders.stage) return true;
        var minStage = self.state.sliders.stage.min;
        var maxStage = self.state.sliders.stage.max;

        var trekDifficulty = trek.properties.difficulty;
        var matching = {
            1:1,
            2:3,
            3:4,
            4:2
        };

        if  (!trekDifficulty) return true;
        return matching[trekDifficulty.id] >= minStage && matching[trekDifficulty.id] <= maxStage;
    };

    this.matchDuration = function (trek) {
        if (!self.state.sliders) return true;
        if (!self.state.sliders.time) return true;
        var minDuration = self.state.sliders.time.min;
        var maxDuration = self.state.sliders.time.max;
        var matching = {
            1:4,
            2:12,
            3:24,
            4:48
        };
        var trekDuration = trek.properties.duration;
        if (minDuration === 0) {
            if (maxDuration == 4) {
                return true;
            }
            if (maxDuration === 0) {
                return trekDuration <= 2;
            }
            return trekDuration <= matching[maxDuration];
        }

        if (minDuration == 4) {
            return trekDuration >= 48;
        }
        if (maxDuration == 4) {
            return trekDuration >= matching[minDuration];
        }
        return trekDuration >= matching[minDuration] && trekDuration <= matching[maxDuration];
    };

    this.matchClimb = function (trek) {
        if (!self.state.sliders) return true;
        if (!self.state.sliders.den) return true;
        var minClimb = self.state.sliders.den.min;
        var maxClimb = self.state.sliders.den.max;

        var matching = {
            1:600,
            2:1000
        };
        var trekClimb = trek.properties.ascent;
        if (minClimb === 0) {
            if (maxClimb == 3) {
                return true;
            }
            if (maxClimb === 0) {
                return trekClimb <= 300;
            }
            return trekClimb <= matching[maxClimb];
        }

        if (minClimb == 3) {
            return trekClimb >= 1400;
        }
        if (maxClimb == 3) {
            return trekClimb >= matching[minClimb];
        }
        return trekClimb >= matching[minClimb] && trekClimb <= matching[maxClimb];
    };

    this.matchRoute = function (trek) {
        if (!trek.properties.route || !self.state.route)
            return true;
        var routes = [];
        for (var r in self.state.route)
            routes.push(r);
        if (routes.length === 0)
            return true;
        return $.inArray(trek.properties.route, routes) != -1;
    };

    this._matchList = function (trek, category, property) {
        var list = [];
        for (var filter in self.state[category]) {
            if (self.state[category][filter] === true) {
                list.push(''+filter);
            }
        }
        // All deselected, means always match !
        if (list.length === 0) {
            return true;
        }

        var match = false;
        // If at least, one is among selected, then it matches !
        for (var i=0; i<trek.properties[property].length; i++) {
            var item = trek.properties[property][i],
                id = item.id || item.pk || item.code;
            if ($.inArray(''+id, list) != -1) {
                match = true;
                break;
            }
        }
        if (!match) {
            /*
            console.log("Match " + category + ": " + 
                        JSON.stringify(trek.properties[property]) + ' != ' +
                        list.join());
            */
        }
        return match;
    };

    this.search = function (trek) {
        var searched = self.state.search;
        if (!searched) return true;

        var htmldecode = function (value) {
          return $('<div/>').html(value).text();
        };

        var simplematch = function (property) {
            /*
            Split searched string on space, and if at least
            one bit matches, returns true;
            */
            var bits = searched.toUpperCase();

            return htmldecode(property).toUpperCase().indexOf(bits) != -1 ? true : false;
        };

        var props = ['name', 'departure', 'arrival', 'ambiance',
                     'description_teaser', 'description', 'access', 'advice'];
        for (var i=0; i<props.length; i++) {
            var prop = props[i];
            if ((prop in trek.properties) && simplematch(trek.properties[prop]))
                return true;
        }

        // District
        for (var i=0; i<trek.properties.districts.length; i++) {
            var district = trek.properties.districts[i];
            if (simplematch(district.name))
                return true;
        }
        // Cities
        for (var i=0; i<trek.properties.cities.length; i++) {
            var city = trek.properties.cities[i];
            if (simplematch(city.code) || simplematch(city.name))
                return true;
        }
        // POIs
        for (var i=0; i<trek.properties.pois.length; i++) {
            var poi = trek.properties.pois[i];
            if (simplematch(poi.name) ||
                simplematch(poi.description) ||
                simplematch(poi.type))
                return true;
        }
        return false;
    };


    /**
     * Helper functions for string <--> hexadecimal
     */
    function d2h(d) {
        return d.toString(16);
    }
    function h2d (h) {
        return parseInt(h, 16);
    }
    function stringToHex (tmp) {
        var str = '',
            i = 0,
            tmp_len = tmp.length,
            c;
        for (; i < tmp_len; i += 1) {
            c = tmp.charCodeAt(i);
            str += d2h(c) + '-';
        }
        return str;
    }
    function hexToString (tmp) {
        var arr = tmp.split('-'),
            str = '',
            i = 0,
            arr_len = arr.length,
            c;
        for (; i < arr_len; i += 1) {
            c = String.fromCharCode( h2d( arr[i] ) );
            str += c;
        }
        return str;
    }
};
