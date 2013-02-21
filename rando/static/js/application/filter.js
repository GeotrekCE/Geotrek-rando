// JavaScript Document
function TrekFilter()
{
    
    var self = this;
    self.matching = [];
    self.visible = null;

    this.initEvents = function () {
        $(".theme .filter").unbind('click').on('click', self.filterChanged);
        $("select#usage, select#district, select#city, select#route").chosen().change(self.filterChanged);
        $('#search').unbind('keyup').on("keyup", self.filterChanged);
    }

    this.save = function ()
    {
        localStorage.setItem('filterState', JSON.stringify(self.state));

        self.matching = [];
        for(var i=0; i<window.treks.features.length; i++) {
            var trek = window.treks.features[i],
                trekid = trek.properties.pk;
            if (self.match(trek)) {
                self.matching.push(trekid);
            }
        }
        $(self).trigger("filterchange", [self.matching]);
    }

    this.load = function () {
        var retrievedObject = localStorage.getItem('filterState');
        self.state = retrievedObject ? JSON.parse(retrievedObject) : {};
        if (!('sliders' in self.state)) {
           self.state['sliders'] = {};
        }
        $('#search').val(self.state.search || '');
        for (category in self.state) {
            for (filter in self.state[category]) {
                if (filter == 'undefined' || filter == '')
                    continue;
                var value = self.state[category][filter],
                    elem = $("[data-filter='" + category + "'][data-id='" + filter + "']");

                if (elem.is('input')) {
                    elem.attr('checked', !!value);
                }
                if (elem.is('option')) {
                    if (!!value) elem.attr('selected', 'selected');
                    else elem.removeAttr('selected');
                }
                else if ($('#' + filter).hasClass('ui-slider')) {
                    $('#' + filter).slider('values', 0, value.min);
                    $('#' + filter).slider('values', 1, value.max);
                }
                else {
                    if (elem.length == 0) {
                        console.warn('Unknown ' + filter);
                    }
                    else {
                        if (value)
                            elem.addClass('active');
                        else
                            elem.removeClass('active');
                    }
                }
            }
        }
        self.save();
        self.initEvents();
    }

    this.setVisible = function (pks) {
        self.visible = pks;
        self.save();
    }

    this.filterChanged = function (e) {
        var elem = $(elem).data("filter") ? $(e.target) : $(e.target).parents('.filter')
          , category = $(elem).data("filter");
        console.log('Filter changed: ' + category);
        if (!(category in self.state)) {
            self.state[category] = {};
        }
        var dataid = $(elem).data("id");

        if ($(elem).is("input[type='checkbox']")) {
            self.state[category][dataid] = $(e.target)[0].checked;
        }
        else if ($(elem).is("select")) {
            var values = $(e.target).val();
            self.state[category] = {};
            for (v in values) {
                self.state[category][values[v]] = true;
            }
        }
        else if ($(elem).attr("id") == 'search') {
            self.state[category] = $(e.target).val();
        }
        else {
            elem.toggleClass('active');
            self.state[category][dataid] = elem.hasClass("active");
        }
        self.save();
    }

    this.sliderChanged = function(minVal, maxVal, name, slider)
    {
        if (!(name in self.state['sliders'])) {
            self.state['sliders'][name] = {};
        }
        self.state['sliders'][name]['min'] = minVal;
        self.state['sliders'][name]['max'] = maxVal;
        self.save();
    }

    this.match = function(trek) {
        if (this.matchStage(trek) && 
            this.matchDuration(trek) &&
            this.matchClimb(trek) &&
            this._matchList(trek, 'theme', 'themes') &&
            this._matchList(trek, 'usage', 'usages') &&
            this._matchList(trek, 'district', 'districts') &&
            this._matchList(trek, 'city', 'cities') &&
            this.matchRoute(trek) &&
            this.search(trek) && 
            (self.visible == null || $.inArray(trek.properties.pk, self.visible) != -1))
             return true;
        return false;
    }

    this.matchStage = function (trek) {
        if (!this.state.sliders.stage) return true;
        var minStage = this.state.sliders.stage.min;
        var maxStage = this.state.sliders.stage.max;
        
        var trekDifficulty = trek.properties.difficulty;
        if  (!trekDifficulty) return true;
        return trekDifficulty.id >= minStage && trekDifficulty.id <= maxStage;
    }

    this.matchDuration = function (trek) {
        if (!this.state.sliders.time) return true;
        var minDuration = this.state.sliders.time.min;
        var maxDuration = this.state.sliders.time.max;
        var matching = {
            1:12,
            2:24,
            3:48,
        };
        var trekDuration = trek.properties.duration;
        if (minDuration == 0) {
            if (maxDuration == 4) {
                return true;
            }
            if (maxDuration == 0) {
                return trekDuration <= 12;
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
    }

    this.matchClimb = function (trek) {
        if (!this.state.sliders.den) return true;
        var minClimb = this.state.sliders.den.min;
        var maxClimb = this.state.sliders.den.max;

        var matching = {
            1:200,
            2:700,
        };
        var trekClimb = trek.properties.ascent;
        if (minClimb == 0) {
            if (maxClimb == 3) {
                return true;
            }
            if (maxClimb == 0) {
                return trekClimb <= 200;
            } 
            return trekClimb <= matching[maxClimb];
        }

        if (minClimb == 3) {
            return trekClimb >= 1000;
        } 
        if (maxClimb == 3) {
            return trekClimb >= matching[minClimb];
        }
        return trekClimb >= matching[minClimb] && trekClimb <= matching[maxClimb];
    }

    this.matchRoute = function (trek) {
        if (!trek.properties.route || !this.state.route)
            return true;
        var routes = [];
        for (r in this.state.route)
            routes.push(r);
        if (routes.length == 0)
            return true;
        return $.inArray(trek.properties.route, routes) != -1;
    }

    this._matchList = function (trek, category, property) {
        var list = [];
        for (filter in this.state[category]) {
            if (this.state[category][filter] === true) {
                list.push(''+filter);
            }
        }
        // All deselected, means always match !
        if (list.length == 0) {
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
    }

    this.search = function (trek) {
        var searched = this.state.search;
        if (!searched) return true;

        var htmldecode = function (value) { 
          return $('<div/>').html(value).text(); 
        }

        var simplematch = function (property) {
            /*
            Split searched string on space, and if at least
            one bit matches, returns true;
            */
            var bits = searched.toUpperCase().split(' ');
            for (var i=0; i<bits.length; i++) {
                var needle = $.trim(bits[i]);
                if (htmldecode(property).toUpperCase().indexOf(needle) != -1)
                    return true;
            }
            return false;
        }
        
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
    }

};