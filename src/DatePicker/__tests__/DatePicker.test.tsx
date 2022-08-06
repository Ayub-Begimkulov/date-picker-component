import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { DatePicker, DatePickerProps } from '../DatePicker';

const initialDate = new Date(2022, 7, 1);
const today = new Date(2022, 7, 2);

const TestApp = ({
  value = initialDate,
  onChange,
  ...rest
}: Partial<DatePickerProps>) => {
  const [date, setDate] = useState(value);

  const handleChange = (value: Date) => {
    onChange?.(value);
    setDate(value);
  };

  return <DatePicker value={date} onChange={handleChange} {...rest} />;
};

describe('DatePicker', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(today);
  });

  it('should show correct date in input', () => {
    render(<TestApp />);

    expect(screen.getByTestId('date-picker-input')).toHaveValue('01-08-2022');
  });

  it('should open popup when we click on input', () => {
    render(<TestApp />);

    userEvent.click(screen.getByTestId('date-picker-input'));

    expect(screen.queryByTestId('date-picker-popup')).toBeInTheDocument();
  });

  it('should close popup when we click outside', () => {
    render(<TestApp />);

    // open popup
    userEvent.click(screen.getByTestId('date-picker-input'));

    expect(screen.queryByTestId('date-picker-popup')).toBeInTheDocument();

    // close popup
    userEvent.click(document.documentElement);

    expect(screen.queryByTestId('date-picker-popup')).not.toBeInTheDocument();
  });

  it('should highlight today', () => {
    render(<TestApp />);

    // open popup
    userEvent.click(screen.getByTestId('date-picker-input'));

    expect(screen.queryByTestId('date-picker-popup')).toBeInTheDocument();

    const todayCells = screen
      .queryAllByTestId('date-picker-popup-cell')
      .filter(item => item.classList.contains('CalendarPanelItem--today'));

    expect(todayCells).toHaveLength(1);
    const todayCell = todayCells[0];

    expect(todayCell).toHaveTextContent(today.getDate().toString());
  });

  it('should highlight selected date', () => {
    const selectedDate = initialDate;

    render(<DatePicker value={selectedDate} onChange={() => {}} />);

    // open popup
    userEvent.click(screen.getByTestId('date-picker-input'));

    expect(screen.queryByTestId('date-picker-popup')).toBeInTheDocument();

    const selectedCells = screen
      .queryAllByTestId('date-picker-popup-cell')
      .filter(item => item.classList.contains('CalendarPanelItem--selected'));

    expect(selectedCells).toHaveLength(1);
    const selectedCell = selectedCells[0];

    expect(selectedCell).toHaveTextContent(selectedDate.getDate().toString());
  });

  it('should select date', async () => {
    const onChange = jest.fn();
    render(<TestApp onChange={onChange} />);

    // open popup
    userEvent.click(screen.getByTestId('date-picker-input'));

    expect(screen.queryByTestId('date-picker-popup')).toBeInTheDocument();

    const selectCells = screen
      .getAllByTestId('date-picker-popup-cell')
      // get 15-th date
      .filter(item => item.textContent === '15');

    expect(selectCells).toHaveLength(1);
    const cell = selectCells[0];

    userEvent.click(cell);

    // popup must be closed
    expect(screen.queryByTestId('date-picker-popup')).not.toBeInTheDocument();

    expect(onChange).toBeCalledWith(new Date(2022, 7, 15));
    expect(screen.getByTestId('date-picker-input')).toHaveValue('15-08-2022');
  });

  it('should apply valid date from input on outside click', () => {
    const onChange = jest.fn();
    render(<TestApp onChange={onChange} />);

    const input = screen.getByTestId('date-picker-input');

    userEvent.clear(input);
    userEvent.type(input, '31-08-2022');

    // outside click
    userEvent.click(document.documentElement);

    expect(onChange).toBeCalledWith(new Date(2022, 7, 31));
  });

  it('should apply valid date from input on enter press', () => {
    const onChange = jest.fn();
    render(<TestApp onChange={onChange} />);

    const input = screen.getByTestId('date-picker-input');

    userEvent.clear(input);
    userEvent.type(input, '31-08-2022');

    // outside click
    userEvent.keyboard('[Enter]');

    expect(onChange).toBeCalledWith(new Date(2022, 7, 31));
  });

  it('should reset invalid date from input on outside click', () => {
    const initialDateString = '01-08-2022';

    const onChange = jest.fn();
    render(<TestApp onChange={onChange} />);

    const input = screen.getByTestId('date-picker-input');

    userEvent.clear(input);
    userEvent.type(input, '32-08-2022');

    // outside click
    userEvent.click(document.documentElement);

    expect(onChange).not.toBeCalled();
    expect(input).toHaveValue(initialDateString);
  });

  it('should reset invalid date from input on enter press', () => {
    const initialDateString = '01-08-2022';

    const onChange = jest.fn();
    render(<TestApp onChange={onChange} />);

    const input = screen.getByTestId('date-picker-input');

    userEvent.clear(input);
    userEvent.type(input, '32-08-2022');

    // outside click
    userEvent.keyboard('[Enter]');

    expect(onChange).not.toBeCalled();
    expect(input).toHaveValue(initialDateString);
  });

  it('should show correct month in popup', () => {
    const initialDatePopupString = 'Aug 2022';

    render(<TestApp />);

    const input = screen.getByTestId('date-picker-input');

    // open popup
    userEvent.click(input);

    expect(screen.getByTestId('date-picker-popup-month')).toHaveTextContent(
      initialDatePopupString
    );
  });

  it('should move to the next month', () => {
    const initialDatePopupString = 'Aug 2022';

    render(<TestApp />);

    const input = screen.getByTestId('date-picker-input');

    // open popup
    userEvent.click(input);

    const nextMonthButton = screen.getByTestId('date-picker-popup-next-month');
    const popupMonth = screen.getByTestId('date-picker-popup-month');

    expect(popupMonth).toHaveTextContent(initialDatePopupString);

    userEvent.click(nextMonthButton);

    expect(popupMonth).toHaveTextContent('Sep 2022');

    userEvent.click(nextMonthButton);

    expect(popupMonth).toHaveTextContent('Oct 2022');
  });

  it('should move to the prev month', () => {
    const initialDatePopupString = 'Aug 2022';

    render(<TestApp />);

    const input = screen.getByTestId('date-picker-input');

    // open popup
    userEvent.click(input);

    const prevMonthButton = screen.getByTestId('date-picker-popup-prev-month');
    const popupMonth = screen.getByTestId('date-picker-popup-month');

    expect(popupMonth).toHaveTextContent(initialDatePopupString);

    userEvent.click(prevMonthButton);

    expect(popupMonth).toHaveTextContent('Jul 2022');

    userEvent.click(prevMonthButton);

    expect(popupMonth).toHaveTextContent('Jun 2022');
  });

  it('should move to the next year', () => {
    const initialDatePopupString = 'Aug 2022';

    render(<TestApp />);

    const input = screen.getByTestId('date-picker-input');

    // open popup
    userEvent.click(input);

    const nextYearButton = screen.getByTestId('date-picker-popup-next-year');
    const popupMonth = screen.getByTestId('date-picker-popup-month');

    expect(popupMonth).toHaveTextContent(initialDatePopupString);

    userEvent.click(nextYearButton);

    expect(popupMonth).toHaveTextContent('Aug 2023');

    userEvent.click(nextYearButton);

    expect(popupMonth).toHaveTextContent('Aug 2024');
  });

  it('should move to the prev year', () => {
    const initialDatePopupString = 'Aug 2022';

    render(<TestApp />);

    const input = screen.getByTestId('date-picker-input');

    // open popup
    userEvent.click(input);

    const prevYearButton = screen.getByTestId('date-picker-popup-prev-year');
    const popupMonth = screen.getByTestId('date-picker-popup-month');

    expect(popupMonth).toHaveTextContent(initialDatePopupString);

    userEvent.click(prevYearButton);

    expect(popupMonth).toHaveTextContent('Aug 2021');

    userEvent.click(prevYearButton);

    expect(popupMonth).toHaveTextContent('Aug 2020');
  });

  it('should update popup calendar when we update input value', () => {
    const initialDatePopupString = 'Aug 2022';

    render(<TestApp />);

    const input = screen.getByTestId('date-picker-input');

    // open popup
    userEvent.click(input);

    const popupMonth = screen.getByTestId('date-picker-popup-month');

    expect(popupMonth).toHaveTextContent(initialDatePopupString);

    userEvent.clear(input);
    userEvent.type(input, '01-01-2022');

    expect(popupMonth).toHaveTextContent('Jan 2022');

    userEvent.clear(input);
    userEvent.type(input, '15-10-2002');

    expect(popupMonth).toHaveTextContent('Oct 2002');
  });

  describe('min/max', () => {
    it('highlight input with out of range date', () => {
      render(
        <TestApp min={new Date(2022, 1, 1)} max={new Date(2022, 12, 31)} />
      );

      const input = screen.getByTestId('date-picker-input');

      // max
      userEvent.clear(input);
      userEvent.type(input, '07-07-2023');

      expect(input).toHaveClass('DatePicker__input--invalid');

      // min
      userEvent.clear(input);
      userEvent.type(input, '07-07-2021');

      expect(input).toHaveClass('DatePicker__input--invalid');

      // correct
      userEvent.clear(input);
      userEvent.type(input, '07-07-2022');

      expect(input).not.toHaveClass('DatePicker__input--invalid');
    });

    it('should disable dates out of range', () => {
      const onChange = jest.fn();
      render(
        <TestApp
          onChange={onChange}
          min={new Date(2022, 1, 1)}
          max={new Date(2022, 12, 31)}
        />
      );

      const input = screen.getByTestId('date-picker-input');

      userEvent.click(input);

      const prevYearButton = screen.getByTestId('date-picker-popup-prev-year');
      const nextYearButton = screen.getByTestId('date-picker-popup-next-year');

      // min
      userEvent.click(prevYearButton);

      const minDateCells = screen.getAllByTestId('date-picker-popup-cell');

      expect(
        minDateCells.every(cell =>
          cell.classList.contains('CalendarPanelItem--not-in-range')
        )
      ).toBe(true);

      // click on each cell
      minDateCells.forEach(cell => {
        userEvent.click(cell);
      });

      expect(onChange).not.toBeCalled();

      // max
      // click 2 times to move 1 year ahead of initial date
      userEvent.click(nextYearButton);
      userEvent.click(nextYearButton);

      const maxDateCells = screen.getAllByTestId('date-picker-popup-cell');

      expect(
        maxDateCells.every(cell =>
          cell.classList.contains('CalendarPanelItem--not-in-range')
        )
      ).toBe(true);

      // click on each cell
      maxDateCells.forEach(cell => {
        userEvent.click(cell);
      });

      expect(onChange).not.toBeCalled();
    });
  });
});
