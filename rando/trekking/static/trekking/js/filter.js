function TrekFilter()
{
    var self = this;
    self.treksList = [];
    self.matching = [];
    self._values = {};

    this.setup = function () {

        initSliderFromDOM('difficulty');
        initSliderFromDOM('duration');
        initSliderFromDOM('altitude');

        function initSliderFromDOM (name) {
            var values = $('.' + name + ' .slider-value').map(function () {
                return $(this).data('value');
            });
            self._values[name] = values;

            var min = 0,
                max = values.length-1;

            $('#' + name).slider({
                range: true,
                step: 1,
                min: min,
                max: max,
                values: [min, max],
                slide: saveSlider
            });
        }

        function saveSlider(event, ui) {
            var minVal = ui.values[0],
                maxVal = ui.values[1],
                name = $(this).data("filter");

            if (minVal == $(this).slider('option', 'min') &&
                maxVal == $(this).slider('option', 'max')) {
                // Covers the whole range : equivalent to no filter.
                delete self.state['sliders'][name];
                self.save();
            }
            else {
                self.state.sliders = self.state.sliders || {};
                self.state.sliders[name] = self.state.sliders[name] || {};
                self.state.sliders[name]['min'] = minVal;
                self.state.sliders[name]['max'] = maxVal;
                self.save();
            }
        }
    };

    this.initEvents = function () {
        $(window).unbind('filters:reload').on('filters:reload', function () {self.load();});
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
        $(self).trigger("reset");
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
        for(var i=0; i<self.treksList.length; i++) {
            var trek = self.treksList[i],
                trekid = trek.id;
            if (self.match(trek)) {
                self.matching.push(trekid);
            }
        }

        localStorage.setItem('resultsCount', self.matching.length);
        var serialized = JSON.stringify(self.state);
        localStorage.setItem('filterState', serialized);

        $(window).trigger("filters:changed", [self.matching]);
    };

    this.__loadState = function () {
        var state = null;
        try {
           state = JSON.parse(localStorage.getItem('filterState'));
        }
        catch (err) {}

        state = state || {};
        state.sliders = state.sliders || {};
        state.sliders.duration = state.sliders.duration || {};
        state.sliders.difficulty = state.sliders.difficulty || {};
        state.sliders.altitude = state.sliders.altitude || {};

        return state;
    };

    this.load = function (treksList) {
        self.treksList = treksList || self.treksList;

        self.state = this.__loadState();

        $('#search').val(self.state.search || '');

        for (var category in self.state) {
            for (var filter in self.state[category]) {
                if (filter == 'undefined' || filter === '')
                    continue;
                var value = self.state[category][filter],
                    elem = $("[data-filter='" + category + "'][data-id='" + filter + "']");

                if ($('#' + filter).hasClass('ui-slider')) {
                    var slider = $('#' + filter).data('slider');
                    if (value.min === undefined) value.min = slider.options.min;
                    if (value.max === undefined) value.max = slider.options.max;
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
        self.save();
        self.initEvents();
    };

    this.getResultsCount = function () {
        return localStorage.getItem('resultsCount');
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

    this.match = function(trek) {
        if (this._matchSlider(trek, 'duration', 'duration') &&
            this._matchSlider(trek, 'difficulty', 'difficulty') &&
            this._matchSlider(trek, 'altitude', 'ascent') &&
            this._matchList(trek, 'theme', 'themes') &&
            this._matchList(trek, 'usage', 'usages') &&
            this._matchList(trek, 'district', 'districts') &&
            this._matchList(trek, 'city', 'cities') &&
            this._matchList(trek, 'route', 'route') &&
            this.search(trek))
             return true;
        return false;
    };

    this._matchSlider = function (trek, category, property) {
        var value = trek[property];

        // Trek considered as matching if filter not set or if
        // property is empty.
        if (value === undefined ||
            self.state['sliders'] === undefined ||
            self.state['sliders'][category] === undefined) {
            return true;
        }

        var rangeValues = self._values[category],
            rangeMin = 0,
            rangeMax = rangeValues.length-1,
            min = self.state.sliders[category].min,
            max = self.state.sliders[category].max;

        if (max === rangeMin) {
            // Both on minimum value
            return value <= rangeValues[rangeMin];
        }
        if (min === rangeMax) {
            // Both on maximum values
            return value >= rangeValues[rangeMax];
        }

        var minVal = rangeValues[min - 1],
            maxVal = rangeValues[max + 1];

        if (category == 'altitude' && min != max) {
            minVal = rangeValues[min];
            maxVal = rangeValues[max];
        }

        if (min === rangeMin) {
            // Filter by max only
            return value < maxVal;
        }
        if (max === rangeMax) {
            // Filter by min only
            return value > minVal;
        }
        return value > minVal && value < maxVal;
    };

    this._matchList = function (trek, category, property) {
        // If trek has nothing defined about this property, it matches !
        if (!trek[property]) {
            return true;
        }
        // List of selected values
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
        // If at least, one is among selected, then it matches !
        values = (''+trek[property]).split(',');
        for (var i=0; i<values.length; i++) {
            var item = values[i];
            if ($.inArray(item, list) != -1) {
                return true;
            }
        }
        return false;
    };

    this.search = function (trek) {
        var searched = self.state.search;
        if (!searched) return true;

        var needle = searched.toLowerCase(),
            haystack = trek.fulltext;
        return (new RegExp(needle)).test(haystack);
    };
}
