Rando.models = {};


Rando.models.BaseModel = Backbone.Model.extend({
    parse: function(response, options) {
        response.properties.id = response.id;
        response.properties.geometry = response.geometry;
        return response.properties;
    }
});


Rando.models.Trek = Rando.models.BaseModel.extend({
    get: function (attribute) {
        if (attribute == 'difficulty.id')
            return this.get('difficulty').id;
        return Rando.models.BaseModel.prototype.get.apply(this, arguments);
    }
});


Rando.models.ResultsCollection = Backbone.Collection.extend({
    parse: function(response) {
        this.geojson = response;
        return response.features;
    }
});


Rando.models.TrekCollection = Rando.models.ResultsCollection.extend({
    model: function (attrs, options) {
        return new Rando.models.Trek(attrs, options);
    },

    url: function () {
        var url = $('[data-treks-url]').data('treks-url');
        console.log(url);
        return url;
    }
});
