import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Components

let Cesium;

class GlobeCesiumComponent extends PureComponent {
  componentDidMount() {
    // Init Cesium var
    Cesium = window.Cesium; // eslint-disable-line prefer-destructuring
    Cesium.BingMapsApi.defaultKey = process.env.BING_MAPS_API_KEY;

    // Create viewer object
    this.viewer = new Cesium.Viewer('cesiumContainer', {
      geocoder: false,
      homeButton: false,
      selectionIndicato: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      creditsDisplay: false,
      fullscreenButton: false,
      skyAtmosphere: false
    });

    this.imageryLayers = this.viewer.imageryLayers;

    this.viewModel = {
      layers: [],
      baseLayers: [],
      contextLayers: [],
      upLayer: null,
      downLayer: null,
      selectedLayer: null,
      isSelectableLayer(layer) {
        return this.baseLayers.indexOf(layer) >= 0;
      },
      raise(layer, index) {
        this.imageryLayers.raise(layer);
        this.viewModel.upLayer = layer;
        this.viewModel.downLayer = this.viewModel.layers[Math.max(0, index - 1)];
        this.updateLayerList();
        window.setTimeout(() => {
          this.viewModel.upLayer = null;
          this.viewModel.downLayer = null;
        }, 10);
      },
      lower(layer, index) {
        this.imageryLayers.lower(layer);
        this.viewModel.upLayer =
          this.viewModel.layers[Math.min(this.viewModel.layers.length - 1, index + 1)];
        this.viewModel.downLayer = layer;
        this.updateLayerList();
        window.setTimeout(() => {
          this.viewModel.upLayer = null;
          this.viewModel.downLayer = null;
        }, 10);
      },
      canRaise(layerIndex) {
        return layerIndex > 0;
      },
      canLower(layerIndex) {
        return layerIndex >= 0 && layerIndex < this.imageryLayers.length - 1;
      }
    };

    console.log('this.props', this.props);

    this.baseLayers = this.viewModel.baseLayers;
    this.contextLayers = this.viewModel.contextLayers;

    Cesium.knockout.track(this.viewModel);

    this.setupLayers();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.basemap !== this.props.basemap ||
      nextProps.contextLayersPulse !== this.props.contextLayersPulse ||
      nextProps.mainLayer !== this.props.mainLayer) {
      this.updateLayers(nextProps);
    }
  }

  setupLayers() {
    // Create all the base layers that this example will support.
    // These base layers aren't really special.  It's possible to have multiple of them
    // enabled at once, just like the other layers, but it doesn't make much sense because
    // all of these layers cover the entire globe and are opaque.
    this.addBaseLayerOption(
      'default',
      new Cesium.BingMapsImageryProvider({
        url: 'https://dev.virtualearth.net',
        key: Cesium.BingMapsApi.defaultKey,
        mapStyle: Cesium.BingMapsStyle.AERIAL
      })
    );
  }

  addBaseLayerOption(name, imageryProvider) {
    let layer;
    if (typeof imageryProvider === 'undefined') {
      layer = this.imageryLayers.get(0);
      this.viewModel.selectedLayer = layer;
    } else {
      layer = new Cesium.ImageryLayer(imageryProvider);
    }

    layer.name = name;
    this.baseLayers.push(layer);
    return layer;
  }

  addAdditionalLayerOption(name, imageryProvider, alpha, show) {
    const layer = this.imageryLayers.addImageryProvider(imageryProvider);
    layer.alpha = Cesium.defaultValue(alpha, 0.5);
    layer.show = Cesium.defaultValue(show, true);
    layer.name = name;
    Cesium.knockout.track(layer, ['alpha', 'show', 'name']);
  }

  removeMainLayer() {
    for (let i = 0; i < this.imageryLayers.length; i++) {
      if (this.imageryLayers.get(i).name === 'mainLayer') {
        this.imageryLayers.remove(this.imageryLayers.get(i), false);
      }
    }
  }

  updateLayers(props) {
    const { basemap, contextLayersPulse, mainLayer } = props;
    const { contextLayers, activeLayers } = contextLayersPulse;

    if (basemap) {
      const basemapFound = this.baseLayers.find(l => l.name === basemap.name);
      // Check if the basemap provided has already been added
      if (!basemapFound) {
        const newBasemap = this.addBaseLayerOption(
          basemap.name,
          new Cesium.UrlTemplateImageryProvider({ url: basemap.url })
        );
        this.imageryLayers.add(newBasemap, 0);
        this.imageryLayers.remove(this.viewModel.layers[0], false);
      } else {
        this.imageryLayers.add(basemapFound);
      }
    }

    if (contextLayers && activeLayers) {
      console.log('contextLayers',contextLayers, 'activeLayers', activeLayers);
    }

    if (mainLayer) {
      // Remove previous mainLayer
      this.removeMainLayer();

      this.addAdditionalLayerOption('mainLayer', new Cesium.UrlTemplateImageryProvider({ url: mainLayer }), 1, true);
    }

    const numContextLayers = this.imageryLayers.length;
    this.viewModel.layers.splice(0, this.viewModel.layers.length);
    for (let i = numContextLayers - 1; i >= 0; --i) {
      this.viewModel.layers.push(this.imageryLayers.get(i));
    }
  }

  render() {
    return (
      <div id="cesiumContainer" className="c-globe-cesium" />
    );
  }
}


GlobeCesiumComponent.propTypes = {
  basemap: PropTypes.object,
  contextLayersPulse: PropTypes.array,
  mainLayer: PropTypes.object
};

export default connect(null, null)(GlobeCesiumComponent);
