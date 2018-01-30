import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'routes';
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';

// Components
import Spinner from 'components/ui/Spinner';
import VegaChart from 'components/widgets/charts/VegaChart';
import EmbedLayout from 'components/app/layout/EmbedLayout';

// Services
import DatasetService from 'services/DatasetService';

// Utils
import ChartTheme from 'utils/widgets/theme';

class EmbedDataset extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataset: null,
      loading: true
    };

    // DatasetService
    this.datasetService = new DatasetService(this.props.url.query.id, {
      apiURL: process.env.WRI_API_URL,
      language: props.locale
    });

    // ---------------------- Bindings --------------------------
    this.triggerToggleLoading = this.triggerToggleLoading.bind(this);
    // ----------------------------------------------------------
  }

  componentDidMount() {
    this.datasetService.fetchData('widget, metadata').then((data) => {
      this.setState({
        dataset: data,
        loading: false
      });
    });
  }

  triggerToggleLoading(loading) {
    this.setState({ loading });
  }

  render() {
    const { dataset, loading } = this.state;
    const widgets = dataset && dataset.attributes.widget;
    const metadataObj = dataset && dataset.attributes.metadata[0];
    const datasetName = metadataObj && metadataObj.attributes.info ?
      metadataObj.attributes.info.name : dataset && dataset.attributes.name;
    const datasetDescription = metadataObj && metadataObj.attributes ?
      metadataObj.attributes.description : dataset && dataset.attributes.description;
    let widget = null;

    if (widgets) {
      widget = widgets.find(value => value.attributes.default === true);
    }

    return (
      <EmbedLayout
        title={datasetName}
        description={datasetDescription}
      >
        <div className="c-embed-dataset">
          <Spinner
            isLoading={loading}
            className="-light"
          />
          {widget &&
            <div>
              <div className="widget-content">
                <VegaChart
                  data={widget.attributes.widgetConfig}
                  theme={ChartTheme()}
                  toggleLoading={this.triggerToggleLoading}
                  reloadOnResize
                />
              </div>
              <div className="info">
                <div className="widget-title">
                  <h2>
                    <Link
                      route="explore_detail"
                      params={{ id: dataset.id }}
                    >
                      <a>{datasetName}</a>
                    </Link>
                  </h2>
                </div>
                <div className="widget-description">
                  {datasetDescription}
                </div>
              </div>
            </div>
          }
        </div>
      </EmbedLayout>
    );
  }
}

EmbedDataset.propTypes = {
  url: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  locale: state.common.locale
});

export default withRedux(initStore, mapStateToProps, null)(EmbedDataset);
