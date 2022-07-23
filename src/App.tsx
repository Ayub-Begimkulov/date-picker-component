import { useState } from 'react';
import { DatePicker } from './DatePicker';

import './App.css';

const MIN_DATE = new Date(2022, 6, 1);
const MAX_DATE = new Date(2022, 7, 0);

function App() {
  const [date, setDate] = useState(() => new Date());

  console.log(date.toDateString(), 'App');

  return (
    <div>
      <DatePicker
        value={date}
        onChange={setDate}
        min={MIN_DATE}
        max={MAX_DATE}
      />
    </div>
  );
}

export default App;
