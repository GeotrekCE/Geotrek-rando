// JavaScript Document
function TrekFilter()
{
    
    var self = this;

    this.initEvents = function () {
        $(".theme .theme-icon, .vallee .btn, .access .btn, .usage .btn").unbind('click').on('click', self.filterChanged);
        $(".boucle input").unbind('click').on('click', self.filterChanged);
        $('#search').unbind('keyup').on("keyup", self.filterChanged);
    }

    this.save = function ()
    {
        localStorage.setItem('filterState', JSON.stringify(self.state));
        $(self).trigger("filterchange");
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
                var value = self.state[category][filter],
                    elem = $("[data-id='" + filter + "']");

                if (elem.is('input')) {
                    elem.attr('checked', !!value);
                }
                else if (elem.hasClass('ui-slider')) {
                    elem.slider('values', 0, value.min);
                    elem.slider('values', 1, value.max);
                }
                else {
                    if (value)
                        elem.addClass('active');
                    else
                        elem.removeClass('active');
                }
            }
        }
        this.initEvents();
    }

    this.filterChanged = function (e) {
        var category =$(e.target).data("filter");
        if (!(category in self.state)) {
            self.state[category] = {};
        }
        var dataid = $(e.target).data("id");

        if ($(e.target).is("input[type='checkbox']")) {
            self.state[category][dataid] = $(e.target)[0].checked;
        }
        else if ($(e.target).attr("id") == 'search') {
            self.state[category] = $(e.target).val();
        }
        else {
            $(e.target).toggleClass('active');
            self.state[category][dataid] = $(e.target).hasClass("active");
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


    this.matchStage = function (trek) {
        if (!this.state.sliders.stage) return true;
        var minStage = this.state.sliders.stage.min;
        var maxStage = this.state.sliders.stage.max;
        
        var trekDifficulty = trek.properties.difficulty.id;
        if  (!trekDifficulty) return true;
        return trekDifficulty >= minStage && trekDifficulty <= maxStage;
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
        var trekClimb = trek.properties.duration;
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

    this._matchList = function (trek, category, property) {
        // All deselected, means always match !
        if ($('.' + category + ' .active').length == 0)
            return true;

        var list = [];
        for (filter in this.state[category]) {
            if (this.state[category][filter] === true) {
                list.push(filter);
            }
        }
        // If at least, one is among selected, then it matches !
        for (var i=0; i<trek.properties[property].length; i++) {
            var item = trek.properties[property][i];
            if ($.inArray(''+item.id, list) != -1) {
                return true;
            }
        }
        return false;
    }

/**************** Function Match Boucle ***************************/
    this.matchLoop = function (trek)
    {
        return true; /// return (trek.properties.is_loop == (this.state.boucle  == "1"));
    }

/************************Funcction Search ************************/
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


    this.match = function(trek) {
        if (this.matchStage(trek) && 
            this.matchDuration(trek) &&
            this.matchClimb(trek) &&
            this._matchList(trek, 'theme', 'themes') &&
            this._matchList(trek, 'usage', 'usages') &&
            this._matchList(trek, 'valle', 'districts') &&
            this.matchLoop(trek) &&
            this.search(trek)
            )
             return true;
        return false;
    }
};