import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import './App.css';
import { CountryTable } from './components/CountryTable/CountryTable';

const App = () => {
  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <CountryTable />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default App;
