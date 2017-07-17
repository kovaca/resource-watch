import React from 'react';
import PropTypes from 'prop-types';
import { bisector } from 'd3';
import vega from 'vega';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import isEqual from 'lodash/isEqual';

// Redux
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';
import { toggleTooltip } from 'redactions/tooltip';

// Components
import VegaChartTooltip from './VegaChartTooltip';

class VegaChart extends React.Component {

  constructor(props) {
    super(props);

    // BINDINGS
    this.triggerResize = debounce(this.triggerResize.bind(this), 250);
  }

  componentDidMount() {
    this.mounted = true;
    this.renderChart();
    window.addEventListener('resize', this.triggerResize);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps.data, this.props.data);
  }

  componentDidUpdate() {
    // We should check if the data has changed
    this.renderChart();
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('resize', this.triggerResize);
  }

  /**
   * Event handler for the mouse move events on the chart
   * @param {object} vegaConfig Vega configuration of the chart
   * @param {object[]} visData Data fetched by Vega and used to draw the chart
   * @param {string|number} x x value associated with the position of the cursor
   * @param {object} item Data associated with the hovered mark, if exist
   */
  onMousemove(vegaConfig, visData, x, item) {
    // If the cursor is on top of a mark, we display the data
    // associated to that mark
    // The only exception is for the lines because the data
    // they own is always the first one (first point)
    if (!isEmpty(item) && item.datum.x && item.mark.marktype !== 'line') {
      return this.props.toggleTooltip(true, {
        follow: true,
        children: VegaChartTooltip,
        childrenProps: { item: item.datum }
      });
    }

    // If the chart doesn't have an x axis or if the data is undefined,
    // we don't determine the data to show in the tooltip depending on
    // the x position of the cursor (based on the x scale)
    // We actually hide the tooltip
    const hasXAxis = !!(vegaConfig.axes && vegaConfig.axes.find(axis => axis.type === 'x'));
    if (!hasXAxis || !visData) {
      return this.props.toggleTooltip(false);
    }

    // d3's bisector function needs sorted data because it
    // determines the closest index using with a log2(n)
    // complexity (i.e. splitting the array in two in each
    // iteration)
    const sortedVisData = visData.sort((d1, d2) => d1.x - d2.x);

    // If not, then we retrieve the x position of the cursor,
    // and display the data of the closest point/line/bar
    let data; // eslint-disable-line no-shadow
    if (typeof x === 'string') data = visData.find(d => d.x === x);
    if (typeof x === 'number') {
      const bisectDate = bisector(d => d.x).left;
      const i = bisectDate(sortedVisData, x, 1);
      const d0 = visData[i - 1];
      const d1 = visData[i];
      data = (d0 && d1 && (x - d0.x > d1.x - x)) ? d1 : d0;
    }
    if (x instanceof Date) {
      const bisectDate = bisector(d => d.x).left;
      const i = bisectDate(sortedVisData, x.getTime(), 1);
      const d0 = visData[i - 1];
      const d1 = visData[i];
      data = (d0 && d1 && (x.getTime() - d0.x > d1.x - x.getTime())) ? d1 : d0;
    }

    if (data) {
      return this.props.toggleTooltip(true, {
        follow: true,
        children: VegaChartTooltip,
        childrenProps: { item: data }
      });
    }

    return null;
  }

  setSize() {
    if (this.chartViewportContainer) {
      this.width = this.chartViewportContainer.offsetWidth;
      this.height = this.chartViewportContainer.offsetHeight;
    }
  }

  /**
   * Return the Vega configuration of the chart
   * This method is necessary because we need to define the size of
   * the chart, as well as a signal to display a tooltip
   * @returns {object}
   */
  getVegaConfig() {
    const padding = this.props.data.padding || { top: 20, right: 20, bottom: 20, left: 20 };
    const size = {
      // Please don't change these conditions, the bar chart
      // needs its height and width to not be overriden to display
      // properly
      width: this.props.data.width || (this.width - padding.left - padding.right),
      height: this.props.data.height || (this.height - padding.top - padding.bottom)
    };

    // This signal is used for the tooltip
    const signal = {
      /* eslint-disable */
      "name": "onMousemove",
      "streams": [{
        "type": "mousemove",
        "expr": "{ x: iscale('x', eventX()), item: eventItem() }"
      }]
      /* eslint-enable */
    };

    const config = Object.assign({}, this.props.data, size);

    // If the configuration already has signals, we don't override it
    // but push a new one instead
    if (config.signals) {
      config.signals.push(signal);
    } else {
      config.signals = [signal];
    }

    return config;
  }

  /**
   * Toggle the visibility of the loader depending of the
   * passed value
   * @param {boolean} isLoading
   */
  toggleLoading(isLoading) {
    if (this.mounted && this.props.toggleLoading) {
      this.props.toggleLoading(isLoading);
    }
  }

  parseVega() {
    const theme = this.props.theme || {};
    const vegaConfig = this.getVegaConfig();

    // While Vega parses the configuration and renders the chart
    // we display a loader
    this.toggleLoading(true);

    vega.parse.spec(vegaConfig, theme, (err, chart) => {
      // If there's an error or the component has been unmounted
      // we don't do anything
      if (err || !this.mounted) return;

      // We render the chart
      const vis = chart({ el: this.chart, renderer: 'canvas' });
      vis.update();

      // We toggle off the loader once we've rendered the chart
      this.toggleLoading(false);

      // Data fetched by Vega and used to draw the chart
      const data = vis.data().table;

      // We display a tooltip at maximum 60 FPS (approximatively)
      vis.onSignal('onMousemove', throttle((_, { x, item }) => {
        this.onMousemove(vegaConfig, data, x, item);
      }, 16));
    });
  }

  triggerResize() {
    if (this.props.reloadOnResize) {
      this.renderChart();
    }
  }

  renderChart() {
    this.setSize();
    this.parseVega();
  }

  render() {
    return (
      <div
        className="c-chart"
        onMouseOut={() => this.props.toggleTooltip(false)}
        ref={(el) => { this.chartViewportContainer = el; }}
      >
        <div ref={(c) => { this.chart = c; }} className="chart" />
      </div>
    );
  }
}

VegaChart.propTypes = {
  reloadOnResize: PropTypes.bool.isRequired,
  // Define the chart data
  data: PropTypes.object,
  theme: PropTypes.object,
  // Callbacks
  toggleLoading: PropTypes.func,
  toggleTooltip: PropTypes.func
};

const mapStateToProps = ({ tooltip }) => ({
  tooltip
});

const mapDispatchToProps = dispatch => ({
  toggleTooltip: (visibility, options) => dispatch(toggleTooltip(visibility, options))
});

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(VegaChart);
