window.Rando = {};

window.ALTIMETRIC_PROFILE_OPTIONS = L.Util.extend({
    fillColor: '#FFD1A1',
    lineColor: '#F77E00',
    lineWidth: 3
}, window.ALTIMETRIC_PROFILE_OPTIONS || {});

window.TREK_LAYER_OPTIONS = L.Util.extend({
    style: {'color': '#F89406', 'weight': 5, 'opacity': 0.8},
    hoverstyle: {'color': '#F89406', 'weight': 5, 'opacity': 1.0},
    outlinestyle: {'color': 'yellow', 'weight': 10, 'opacity': 0.8},
    arrowstyle: {'fill': '#E97000', 'font-weight': 'bold'},
    positionstyle: {'fillOpacity': 1.0, 'opacity': 1.0, 'fillColor': 'white', 'color': 'black', 'width': 3},
    iconifyZoom: 12,
    icons: {
        cluster: {
            size: 20
        }
    },
    clusterOptions: {
        showCoverageOnHover: false,
        maxClusterRadius: 36,
    }
}, window.TREK_LAYER_OPTIONS || {});

window.DETAIL_MAP_OPTIONS = L.Util.extend({
    icons: {
        poi: {
            size: 24
        },
        cluster: {
            size: 30
        },
        parking: {
            size: 18
        },
        pointsReference: {
            size: 16
        },
        information: {
            size: 20
        }
    }
}, window.DETAIL_MAP_OPTIONS || {});

window.DETAIL_POI_OPTIONS = L.Util.extend({
    pan: {
        animate: true,
        duration: 0.8,
        minimumDistance: 150
    },
    listMarginTop: 30,
    scroll: {
        duration: 1000,
        specialEasing: {
            width: 'linear',
            height: 'easeOutBounce'
        }
    }
}, window.DETAIL_POI_OPTIONS || {});
