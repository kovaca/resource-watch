import React, { PureComponent } from 'react';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';

// Redux
import { connect } from 'react-redux';

// Services
import { fetchDashboards } from 'services/dashboard';

// Components
import Spinner from 'components/ui/Spinner';
import CustomTable from 'components/ui/customtable/CustomTable';
import SearchInput from 'components/ui/SearchInput';
import TableFilters from 'components/admin/table-filters';

// constants
import { INITIAL_PAGINATION } from './constants';

// Table components
import EditAction from './actions/EditAction';
import DeleteAction from './actions/DeleteAction';

// TDs
import NameTD from './td/name';
import OwnerTD from './td/owner';
import RoleTD from './td/role';
import PublishedTD from './td/published';
import PreviewTD from './td/preview';

class DashboardsTable extends PureComponent {
  static propTypes = { user: PropTypes.object.isRequired };

  state = {
    dashboards: [],
    pagination: INITIAL_PAGINATION,
    filters: { name: null, 'user.role': 'ADMIN' },
    loading: false
  };

  componentWillMount() {
    this.loadDashboards();
  }

  onFiltersChange = (value) => {
    this.setState({
      filters: {
        ...this.state.filters,
        'user.role': value.value
      }
    },
    () => this.loadDashboards());
  }

  /**
   * Event handler executed when the user search for a dataset
   * @param {string} { value } Search keywords
   */
  onSearch = debounce((value) => {
    const { filters } = this.state;

    if (value.length > 0 && value.length < 3) return;

    this.setState({
      loading: true,
      filters: {
        ...filters,
        name: value
      },
      pagination: INITIAL_PAGINATION
    }, () => this.loadDashboards());
  }, 250)

  onChangePage = (page) => {
    const { pagination } = this.state;

    this.setState({
      pagination: {
        ...pagination,
        page
      }
    });
  }

  loadDashboards = () => {
    const { user: { token } } = this.props;
    const { pagination, filters } = this.state;

    this.setState({ loading: true });

    fetchDashboards(
      {
        includes: 'user',
        ...filters,
        'page[number]': pagination.page,
        'page[size]': pagination.limit,
        application: process.env.APPLICATIONS,
        env: process.env.API_ENV
      },
      { Authorization: token }
    )
      .then((response) => {
        // TO-DO pagination, pending to be implemented in the API
        this.setState({
          loading: false,
          dashboards: response
        });
      })
      .catch(error => toastr.error('There was an error loading the dashboards', error));
  }

  render() {
    const { pagination, loading, dashboards } = this.state;

    return (
      <div className="c-dashboards-table">
        <Spinner className="-light" isLoading={loading} />

        <TableFilters
          filtersChange={this.onFiltersChange}
        />

        <SearchInput
          input={{ placeholder: 'Search dashboard' }}
          link={{
            label: 'New dashboard',
            route: 'admin_dashboards_detail',
            params: { tab: 'dashboards', id: 'new' }
          }}
          onSearch={this.onSearch}
        />

        <CustomTable
          columns={[
            { label: 'Name', value: 'name', td: NameTD },
            { label: 'Owner', value: 'owner', td: OwnerTD },
            { label: 'Role', value: 'role', td: RoleTD },
            { label: 'Preview', value: 'slug', td: PreviewTD },
            { label: 'Published', value: 'published', td: PublishedTD }
          ]}
          actions={{
            show: true,
            list: [
              { name: 'Edit', route: 'admin_dashboards_detail', params: { tab: 'dashboards', subtab: 'edit', id: '{{id}}' }, show: true, component: EditAction },
              { name: 'Remove', route: 'admin_dashboards_detail', params: { tab: 'dashboards', subtab: 'remove', id: '{{id}}' }, component: DeleteAction }
            ]
          }}
          sort={{
            field: 'name',
            value: 1
          }}
          filters={false}
          data={dashboards}
          onChangePage={this.onChangePage}
          onRowDelete={() => this.loadDashboards()}
          pagination={pagination}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({ user: state.user });

export default connect(mapStateToProps, null)(DashboardsTable);
