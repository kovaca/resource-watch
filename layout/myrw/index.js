import { connect } from 'react-redux';

// component
import LayoutMyRW from './component';

export default connect(
  (state) => ({
    user: state.user,
  }),
)(LayoutMyRW);
