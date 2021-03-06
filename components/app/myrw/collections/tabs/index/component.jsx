import {
  useState,
  useCallback,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from 'react-query';

// components
import Spinner from 'components/ui/Spinner';
import CollectionsList from 'components/collections-list';

// hooks
import usePaginatedCollections from 'hooks/collection/fetch-paginated-collections';

const CollectionsIndex = ({
  token,
}) => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    size: 0,
    pages: 0,
  });
  const queryClient = useQueryClient();
  const {
    data: {
      collections,
      meta,
    },
    isFetchedAfterMount,
    isFetching,
    isSuccess,
  } = usePaginatedCollections(
    token,
    {
      'page[size]': pagination.limit,
      'page[number]': pagination.page,
    },
    {
      initialData: {
        collections: [],
        meta: {},
      },
      initialStale: true,
      keepPreviousData: true,
    },
  );

  const handlePagination = useCallback((_nextPage) => {
    setPagination({
      ...pagination,
      page: _nextPage,
    });
  }, [pagination]);

  const handleAfterDeleteCollection = useCallback(async () => {
    await queryClient.invalidateQueries(['paginated-collections']);
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: 1,
    }));
  }, [queryClient]);

  useEffect(() => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      ...meta['total-items'] && {
        size: meta['total-items'],
      },
      ...meta['total-pages'] && {
        pages: meta['total-pages'],
      },
    }));
  }, [meta]);

  return (
    <>
      {(isFetching && isFetchedAfterMount) && (
        <Spinner
          isLoading
          className="-transparent"
        />
      )}
      {isSuccess && (
        <CollectionsList
          collections={collections}
          pagination={pagination}
          onChangePage={handlePagination}
          onRowDelete={handleAfterDeleteCollection}
        />
      )}
    </>
  );
};

CollectionsIndex.propTypes = {
  token: PropTypes.string.isRequired,
};

export default CollectionsIndex;
