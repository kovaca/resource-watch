import { connect } from 'react-redux';

// component
import AdminHeaderUser from './component';

export default connect(
  (state) => ({
    user: state.user,
  }),
  null,
)(AdminHeaderUser);
