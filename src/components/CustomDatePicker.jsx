import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Check,
  AlertCircle,
  Clock
} from 'lucide-react';

const CustomDatePicker = ({
  value = null,
  onChange = () => {},
  minDate = null,
  maxDate = null,
  placeholder = "Select date",
  label = "",
  required = false,
  disabled = false,
  error = "",
  format = "DD/MM/YYYY",
  showTime = false,
  size = "md",
  className = "",
  onValidation = () => {},
  closeOnSelect = true,
  highlightToday = true,
  showClearButton = true,
  position = "auto",
  weekStartsOn = 1,
  disabledDates = [],
  customValidation = null,
  yearRange = { start: 1900, end: 2100 }
}) => {

  const createSafeLocalDate = (year, month, day) => new Date(year, month, day);

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const separators = ['/', '-', '.'];
    let parts = [], separator = '';
    for (const sep of separators) {
      if (dateString.includes(sep)) { parts = dateString.split(sep); separator = sep; break; }
    }
    if (parts.length !== 3) return null;
    let day, month, year;
    switch (format) {
      case 'MM/DD/YYYY': [month, day, year] = parts; break;
      case 'YYYY-MM-DD': [year, month, day] = parts; break;
      default: [day, month, year] = parts; break;
    }
    const yearNum = parseInt(year), monthNum = parseInt(month), dayNum = parseInt(day);
    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return null;
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return null;
    return createSafeLocalDate(yearNum, monthNum - 1, dayNum);
  };

  const createLocalDate = (dateInput) => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
      return createSafeLocalDate(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
    }
    if (typeof dateInput === 'string') {
      if (dateInput.includes('T') || dateInput.includes('Z')) {
        const d = new Date(dateInput);
        return createSafeLocalDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      } else if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = dateInput.split('-').map(Number);
        return createSafeLocalDate(y, m - 1, d);
      } else {
        return parseDate(dateInput);
      }
    }
    try {
      const d = new Date(dateInput);
      if (!isNaN(d.getTime())) return createSafeLocalDate(d.getFullYear(), d.getMonth(), d.getDate());
    } catch (e) { console.warn('CustomDatePicker: Invalid date input:', dateInput); }
    return null;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    if (value) { try { return createLocalDate(value); } catch (e) { return null; } }
    return null;
  });
  const [view, setView] = useState('days');
  const [time, setTime] = useState({ hours: '00', minutes: '00' });
  const [internalError, setInternalError] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});

  const calendarRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const CALENDAR_HEIGHT = 400;
  const CALENDAR_WIDTH = 320;
  const MARGIN = 8;

  const calculateDropdownStyle = () => {
    if (!inputRef.current) return {};
    const rect = inputRef.current.getBoundingClientRect();
    const viewportWidth  = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    let resolvedDir = position;
    if (position === 'auto') {
      if (spaceBelow >= CALENDAR_HEIGHT + MARGIN) resolvedDir = 'bottom';
      else if (spaceAbove >= CALENDAR_HEIGHT + MARGIN) resolvedDir = 'top';
      else resolvedDir = spaceBelow >= spaceAbove ? 'bottom' : 'top';
    }
    let left = rect.left + scrollX;
    if (left + CALENDAR_WIDTH > viewportWidth + scrollX - MARGIN) left = viewportWidth + scrollX - CALENDAR_WIDTH - MARGIN;
    if (left < scrollX + MARGIN) left = scrollX + MARGIN;
    let top, maxHeight;
    if (resolvedDir === 'bottom') {
      top = rect.bottom + scrollY + MARGIN;
      maxHeight = Math.min(CALENDAR_HEIGHT, viewportHeight - rect.bottom - MARGIN * 2);
    } else {
      const availableAbove = rect.top - MARGIN * 2;
      maxHeight = Math.min(CALENDAR_HEIGHT, availableAbove);
      top = rect.top + scrollY - maxHeight - MARGIN;
    }
    return {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${CALENDAR_WIDTH}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: 99999,
      overflowY: maxHeight < CALENDAR_HEIGHT ? 'auto' : 'visible',
    };
  };

  useEffect(() => {
    if (!isOpen) return;
    setDropdownStyle(calculateDropdownStyle());
    const update = () => setDropdownStyle(calculateDropdownStyle());
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const sizeConfig = {
    sm: { input: 'px-3 py-2 text-sm', calendar: 'w-72', dayCell: 'w-8 h-8 text-sm', button: 'px-2 py-1 text-xs' },
    md: { input: 'px-4 py-3 text-sm', calendar: 'w-80', dayCell: 'w-10 h-10 text-sm', button: 'px-3 py-2 text-sm' },
    lg: { input: 'px-5 py-4 text-base', calendar: 'w-96', dayCell: 'w-12 h-12 text-base', button: 'px-4 py-2 text-base' }
  };
  const config = sizeConfig[size];

  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : createLocalDate(date);
    if (!d || isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    switch (format) {
      case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
      default: return `${day}/${month}/${year}`;
    }
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  const validateDate = (date) => {
    if (!date) { if (required) return 'Date is required'; return ''; }
    if (minDate && date < createLocalDate(minDate)) return `Date must be after ${formatDate(createLocalDate(minDate))}`;
    if (maxDate && date > createLocalDate(maxDate)) return `Date must be before ${formatDate(createLocalDate(maxDate))}`;
    const dateString = formatDate(date);
    if (disabledDates.includes(dateString)) return 'This date is not available';
    if (customValidation) { const e = customValidation(date); if (e) return e; }
    return '';
  };

  const handleDateSelect = (date) => {
    const cleanDate = createSafeLocalDate(date.getFullYear(), date.getMonth(), date.getDate());
    const validationError = validateDate(cleanDate);
    setInternalError(validationError);
    if (!validationError) {
      setSelectedDate(cleanDate);
      // ✅ FIX: Do NOT setCurrentDate(cleanDate) here.
      // currentDate controls the calendar VIEW (which month/year is shown).
      // Updating it on selection caused the next open to start at the previously
      // selected date instead of today. currentDate is now only updated on open.
      if (showTime) {
        const finalDate = createSafeLocalDate(cleanDate.getFullYear(), cleanDate.getMonth(), cleanDate.getDate());
        finalDate.setHours(parseInt(time.hours), parseInt(time.minutes));
        onChange(finalDate);
      } else {
        const safeDate = createSafeLocalDate(cleanDate.getFullYear(), cleanDate.getMonth(), cleanDate.getDate());
        safeDate.setHours(12, 0, 0, 0);
        onChange(safeDate);
      }
      onValidation(validationError);
      if (closeOnSelect && !showTime) setIsOpen(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = createSafeLocalDate(year, month, 1);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysToGoBack = (firstDayWeekday - weekStartsOn + 7) % 7;
    const startDay = 1 - daysToGoBack;
    const days = [];
    const today = new Date();
    const todayLocal = createSafeLocalDate(today.getFullYear(), today.getMonth(), today.getDate());
    for (let i = 0; i < 42; i++) {
      const cellDate = createSafeLocalDate(year, month, startDay + i);
      const isCurrentMonth = cellDate.getMonth() === month;
      const isToday = highlightToday && isSameDay(cellDate, todayLocal);
      const isSelected = selectedDate && isSameDay(cellDate, selectedDate);
      const isDisabled = (minDate && cellDate < createLocalDate(minDate)) ||
        (maxDate && cellDate > createLocalDate(maxDate)) ||
        disabledDates.includes(formatDate(cellDate));
      days.push({ date: cellDate, day: cellDate.getDate(), isCurrentMonth, isToday, isSelected, isDisabled });
    }
    return days;
  };

  const generateMonths = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((name, index) => ({
      name, index,
      date: createSafeLocalDate(currentDate.getFullYear(), index, 1),
      isSelected: selectedDate && selectedDate.getMonth() === index && selectedDate.getFullYear() === currentDate.getFullYear()
    }));
  };

  const generateYears = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = Math.max(yearRange.start, currentYear - 50);
    const endYear = Math.min(yearRange.end, currentYear + 50);
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({ year, isSelected: selectedDate && selectedDate.getFullYear() === year });
    }
    return years;
  };

  const navigateMonth = (direction) => setCurrentDate(prev => createSafeLocalDate(prev.getFullYear(), prev.getMonth() + direction, 1));
  const navigateYear = (direction) => setCurrentDate(prev => createSafeLocalDate(prev.getFullYear() + direction, prev.getMonth(), 1));

  const getWeekHeaders = () => {
    const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, i) => allDays[(weekStartsOn + i) % 7]);
  };

  // Sync selectedDate when value prop changes externally
  useEffect(() => {
    const newSelectedDate = value ? createLocalDate(value) : null;
    setSelectedDate(newSelectedDate);
    // ✅ Do NOT sync currentDate from value — keep calendar view at today
  }, [value]);

  // ✅ FIX: Reset calendar view to today every time the picker opens.
  // This prevents stale month/year from a previous selection in any field.
  const handleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      const today = new Date();
      setCurrentDate(createSafeLocalDate(today.getFullYear(), today.getMonth(), today.getDate()));
      setView('days');
    }
    setIsOpen(prev => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideWrapper  = calendarRef.current?.contains(event.target);
      const clickedInsideDropdown = dropdownRef.current?.contains(event.target);
      if (!clickedInsideWrapper && !clickedInsideDropdown) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      if (event.key === 'Escape') setIsOpen(false);
      if (event.key === 'Enter' && view === 'days') {
        const today = new Date();
        handleDateSelect(createSafeLocalDate(today.getFullYear(), today.getMonth(), today.getDate()));
      }
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, view]);

  const displayError = error || internalError;

  const calendarDropdown = isOpen && !disabled ? createPortal(
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <button
            onClick={() => view === 'days' ? navigateMonth(-1) : navigateYear(-1)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView(view === 'months' ? 'days' : 'months')}
              className="px-3 py-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors font-semibold"
            >
              {currentDate.toLocaleString('default', { month: 'long' })}
            </button>
            <button
              onClick={() => setView(view === 'years' ? 'days' : 'years')}
              className="px-3 py-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors font-semibold"
            >
              {currentDate.getFullYear()}
            </button>
          </div>
          <button
            onClick={() => view === 'days' ? navigateMonth(1) : navigateYear(1)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {view === 'days' && (
          <>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {getWeekHeaders().map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((dayInfo, index) => (
                <button
                  key={index}
                  onClick={() => !dayInfo.isDisabled && handleDateSelect(dayInfo.date)}
                  disabled={dayInfo.isDisabled}
                  className={`
                    ${config.dayCell} flex items-center justify-center rounded-lg transition-all duration-200 font-medium
                    ${!dayInfo.isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}
                    ${dayInfo.isToday && !dayInfo.isSelected ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-300 dark:ring-indigo-600' : ''}
                    ${dayInfo.isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : dayInfo.isDisabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 hover:scale-105'
                    }
                  `}
                >
                  {dayInfo.day}
                </button>
              ))}
            </div>
          </>
        )}

        {view === 'months' && (
          <div className="grid grid-cols-3 gap-2">
            {generateMonths().map((month) => (
              <button
                key={month.index}
                onClick={() => { setCurrentDate(month.date); setView('days'); }}
                className={`
                  ${config.button} rounded-lg transition-all duration-200 font-medium
                  ${month.isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30'
                  }
                `}
              >
                {month.name}
              </button>
            ))}
          </div>
        )}

        {view === 'years' && (
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {generateYears().map((yearInfo) => (
              <button
                key={yearInfo.year}
                onClick={() => { setCurrentDate(createSafeLocalDate(yearInfo.year, currentDate.getMonth(), 1)); setView('days'); }}
                className={`
                  ${config.button} rounded-lg transition-all duration-200 font-medium
                  ${yearInfo.isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30'
                  }
                `}
              >
                {yearInfo.year}
              </button>
            ))}
          </div>
        )}

        {showTime && view === 'days' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <select value={time.hours} onChange={(e) => setTime(prev => ({ ...prev, hours: e.target.value }))}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-gray-500">:</span>
              <select value={time.minutes} onChange={(e) => setTime(prev => ({ ...prev, minutes: e.target.value }))}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex justify-between items-center">
        <button
          onClick={() => {
            const today = new Date();
            handleDateSelect(createSafeLocalDate(today.getFullYear(), today.getMonth(), today.getDate()));
          }}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium"
        >
          Today
        </button>
        {showTime && (
          <button
            onClick={() => {
              if (selectedDate && showTime) {
                const finalDate = createSafeLocalDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                finalDate.setHours(parseInt(time.hours), parseInt(time.minutes));
                onChange(finalDate);
                setIsOpen(false);
              }
            }}
            className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm flex items-center gap-1"
          >
            <Check className="h-3 w-3" /> Confirm
          </button>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      <div className="relative" ref={inputRef}>
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={handleOpen}
          className={`
            w-full ${config.input} border rounded-lg shadow-sm transition-all duration-200
            ${disabled
              ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed opacity-60'
              : 'bg-white dark:bg-gray-800 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500'
            }
            ${displayError
              ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500'
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-20
            text-gray-900 dark:text-white
            ${isOpen ? 'ring-2 ring-indigo-500 ring-opacity-20 border-indigo-500' : ''}
          `}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {selectedDate && showClearButton && !disabled && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedDate(null); onChange(null); setInternalError(''); setIsOpen(false); }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Calendar className={`h-5 w-5 ${disabled ? 'text-gray-400' : 'text-indigo-500'}`} />
        </div>
      </div>

      {displayError && (
        <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">{displayError}</span>
        </div>
      )}

      {calendarDropdown}
    </div>
  );
};

export default CustomDatePicker;