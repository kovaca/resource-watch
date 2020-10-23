import { connect } from 'react-redux';

// constants
import {
  getRWAdapter,
} from 'utils/widget-editor';

// component
import DashboardWidgetCardComponent from './component';

export default connect(
  (state) => ({
    user: state.user,
    RWAdapter: getRWAdapter({ locale: state.common.locale }),
  }),
  null,
)(DashboardWidgetCardComponent);
