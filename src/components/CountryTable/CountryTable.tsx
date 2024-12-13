import { gql, useQuery } from '@apollo/client';
import {
  EuiFieldSearch,
  EuiFlexGroup,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSpacer,
  EuiTable,
  EuiTableBody,
  EuiTableHeader,
  EuiTableHeaderCell,
  EuiTablePagination,
  EuiTableRow,
  EuiTableRowCell,
  useEuiTheme,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import Flag from 'react-flagkit';

interface Country {
  code: string;
  name: string;
  continent: {
    name: string;
  };
}

const GET_COUNTRIES = gql`
  {
    countries {
      code
      name
      continent {
        name
      }
    }
  }
`;

export const CountryTable = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<keyof Country>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { error, loading, data } = useQuery<{ countries: Country[] }>(
    GET_COUNTRIES
  );
  const { euiTheme } = useEuiTheme();

  const onTableChange = ({ page, sort }: any) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
    if (sort) {
      const { field: sortField, direction: sortDirection } = sort;
      setSortField(sortField);
      setSortDirection(sortDirection);
    }
  };

  // Handle sorting and pagination of data
  const findCountries = (
    countries: Country[],
    pageIndex: number,
    pageSize: number,
    sortField: string,
    sortDirection: 'asc' | 'desc',
    searchQuery: string
  ) => {
    let filteredCountries = countries.filter(
      (country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.continent.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    let items = filteredCountries.slice(0).sort((a, b) => {
      const getNestedValue = (obj: any, path: string) =>
        path.split('.').reduce((value, key) => value[key], obj);
      const aValue = getNestedValue(a, sortField);
      const bValue = getNestedValue(b, sortField);

      if (sortDirection === 'asc') return aValue < bValue ? -1 : 1;
      else return aValue > bValue ? -1 : 1;
    });

    const startIndex = pageIndex * pageSize;

    return {
      pageOfItems: items.slice(
        startIndex,
        Math.min(startIndex + pageSize, items.length)
      ),
      totalItemCount: filteredCountries.length,
    };
  };

  const { pageOfItems, totalItemCount } = findCountries(
    data ? data.countries : [],
    pageIndex,
    pageSize,
    sortField,
    sortDirection,
    searchQuery
  );

  const pageCount = Math.ceil(totalItemCount / pageSize);

  // Small fix to prevent the page index from exceeding the page count when filtering from beyond first page
  useEffect(() => {
    pageIndex > pageCount && setPageIndex(0);
  }, [pageIndex, pageCount]);

  const headerCells = [
    { label: 'ISO Code', field: 'code' },
    { label: 'Country Name', field: 'name' },
    { label: 'Country flag', field: null },
    { label: 'Continent', field: 'continent.name' },
  ];

  const renderHeaderCells = () => (
    <>
      {headerCells.map((header, index) => (
        <EuiTableHeaderCell
          key={index}
          onSort={
            header.field
              ? () =>
                  onTableChange({
                    sort: {
                      field: header.field,
                      direction: sortDirection === 'asc' ? 'desc' : 'asc',
                    },
                  })
              : undefined
          }
        >
          {header.label}
        </EuiTableHeaderCell>
      ))}
    </>
  );
  const renderErrorMessage = () => (
    <EuiTableRow>
      <EuiTableRowCell colSpan={4}>Error loading data</EuiTableRowCell>
    </EuiTableRow>
  );
  const renderLoadingSpinner = () => <EuiLoadingSpinner size='xl' />;
  const renderEmptyMessage = () => (
    <EuiTableRow>
      <EuiTableRowCell colSpan={4}>No results found</EuiTableRowCell>
    </EuiTableRow>
  );

  const renderRows = () =>
    pageOfItems.map((country, index) => (
      <EuiTableRow key={index}>
        <EuiTableRowCell>{country.code}</EuiTableRowCell>
        <EuiTableRowCell>{country.name}</EuiTableRowCell>
        <EuiTableRowCell>
          <Flag country={country.code} size={42} />
        </EuiTableRowCell>
        <EuiTableRowCell>{country.continent.name}</EuiTableRowCell>
      </EuiTableRow>
    ));

  const onChangeItemsPerPage = (pageSize: number) => {
    setPageSize(pageSize);
    setPageIndex(0);
  };

  const onChangePage = (pageIndex: number) => {
    setPageIndex(pageIndex);
  };

  return (
    <>
      <EuiFlexGroup justifyContent='center'>
        <EuiFieldSearch
          placeholder='Search countries...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          isClearable={true}
          aria-label='Search countries'
        />
      </EuiFlexGroup>

      <EuiSpacer size='l' />

      <EuiPanel
        css={{
          // Button style override for sortable header cells and pagination elements that for some reaosn don't play nice with the theme
          button: {
            backgroundColor: '#1d1e24',
            border: 'none',
            padding: 0,
            color: euiTheme.colors.text,
            marginRight: 4,
            '&:last-child': { marginRight: 0 },
          },
        }}
      >
        <EuiTable>
          <EuiTableHeader>{renderHeaderCells()}</EuiTableHeader>
          <EuiTableBody>
            {/* Error */}
            {error && renderErrorMessage()}
            {/* Loading */}
            {loading && renderLoadingSpinner()}
            {/* No results */}
            {!loading &&
              !error &&
              pageOfItems.length === 0 &&
              renderEmptyMessage()}
            {/* Results */}
            {!loading && !error && pageOfItems.length > 0 && renderRows()}
          </EuiTableBody>
        </EuiTable>

        <EuiSpacer size='m' />

        {/* Pagination */}
        <EuiTablePagination
          activePage={pageIndex}
          itemsPerPage={pageSize}
          itemsPerPageOptions={[20, 50, 100]}
          pageCount={pageCount}
          onChangeItemsPerPage={onChangeItemsPerPage}
          onChangePage={onChangePage}
          compressed
        />
      </EuiPanel>
    </>
  );
};
