import React, { useState, useRef, useEffect, useContext } from 'react';
import { ModalContext } from '../context/ModalContext';
import { FilterContext } from '../context/FilterContext';
import '../styles/IntervalSelector.scss';

export default function IntervalSelector({
  selectedInterval,
  setSelectedInterval,
  todayFormatted,
  currentMonth,
  currentYear,
  customLabel,
  setCustomLabel,
  setDateFrom,
  setDateTo,
  periodLabel,
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);
  const modalContext = useContext(ModalContext);


  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleMonthSelect = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    setViewMonth(month);
    setViewYear(year);
    setDateFrom(formatDate(firstDay));
    setDateTo(formatDate(lastDay));
    setCustomLabel(`${monthNames[month]} ${year}`);
    setSelectedInterval('month');
    setIsCalendarOpen(false);
  };

  const handleYearSelect = (year) => {
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);

    setViewYear(year);
    setDateFrom(formatDate(firstDay));
    setDateTo(formatDate(lastDay));
    setCustomLabel(year.toString());
    setSelectedInterval('year');
    setIsCalendarOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handlePrevYear = () => {
    setViewYear(viewYear - 1);
  };

  const handleNextYear = () => {
    setViewYear(viewYear + 1);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const today = new Date();
    const isCurrentMonth =
      viewMonth === today.getMonth() && viewYear === today.getFullYear();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);
      const day = daysInPrevMonth - firstDay + i + 1;

      days.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          {day}
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();

      days.push(
        <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
          {day}
        </div>
      );
    }

    const totalCells = days.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="calendar-day other-month">
          {i}
        </div>
      );
    }

    return days;
  };

  const getDisplayText = () => {
    if (selectedInterval === 'today') return periodLabel;
    if (selectedInterval === 'month') return customLabel || currentMonth;
    if (selectedInterval === 'year') return customLabel || currentYear;
    if (selectedInterval === 'all') return 'All Time';
    if (selectedInterval === 'custom') {
      if (customLabel) return customLabel;
      return periodLabel;
    }
    return 'Select interval';
  };

  return (
    <div className="interval-selector-wrap" ref={calendarRef}>
      <button
        type="button"
        className="interval-selector"
        onClick={() => setIsCalendarOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isCalendarOpen}
      >
        <i className="material-icons calendar-icon" aria-hidden="true">
          event
        </i>

        <span className="interval-display">
          <span className="interval-text">{getDisplayText()}</span>
          <i className="material-icons dropdown-icon" aria-hidden="true">
            {isCalendarOpen ? 'expand_less' : 'expand_more'}
          </i>
        </span>
      </button>

      {isCalendarOpen && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <div className="month-year-selector">
              <div className="month-selector">
                <span className="selector-label">Month</span>
                <div className="selector-value">
                  <span className="value-text">{monthNames[viewMonth]}</span>
                  <div className="arrow-buttons">
                    <button type="button" className="arrow-btn" onClick={handlePrevMonth}>
                      <i className="material-icons">expand_less</i>
                    </button>
                    <button type="button" className="arrow-btn" onClick={handleNextMonth}>
                      <i className="material-icons">expand_more</i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="year-selector">
                <span className="selector-label">Year</span>
                <div className="selector-value">
                  <span className="value-text">{viewYear}</span>
                  <div className="arrow-buttons">
                    <button type="button" className="arrow-btn" onClick={handlePrevYear}>
                      <i className="material-icons">expand_less</i>
                    </button>
                    <button type="button" className="arrow-btn" onClick={handleNextYear}>
                      <i className="material-icons">expand_more</i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="calendar-body">
            <div className="calendar-weekdays">
              {dayNames.map((day) => (
                <div key={day} className="weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-days">{renderCalendar()}</div>
          </div>

          <div className="calendar-footer">
            <button
              type="button"
              className="quick-select-btn primary"
              onClick={() => handleMonthSelect(viewMonth, viewYear)}
            >
              Select {monthNames[viewMonth]}
            </button>

            <button
              type="button"
              className="quick-select-btn"
              onClick={() => {
                setSelectedInterval('today');
                setCustomLabel('');
                setDateFrom('');
                setDateTo('');
                setIsCalendarOpen(false);
              }}
            >
              Today
            </button>

            <button
              type="button"
              className="quick-select-btn"
              onClick={() => handleYearSelect(viewYear)}
            >
              This Year
            </button>

            <button
              type="button"
              className="quick-select-btn"
              onClick={() => {
                setSelectedInterval('all');
                setCustomLabel('');
                setDateFrom('');
                setDateTo('');
                setIsCalendarOpen(false);
              }}
            >
              All Time
            </button>

            <button
              type="button"
              className="quick-select-btn"
              onClick={() => {
                setSelectedInterval('custom');
                setCustomLabel('');
                setIsCalendarOpen(false);
                modalContext.setIsModalCustomDateOpen(true);
              }}
            >
              Custom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}