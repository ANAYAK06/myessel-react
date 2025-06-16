import React, { useState, useEffect, useRef } from 'react';
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
  format = "DD/MM/YYYY", // DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  showTime = false,
  size = "md", // sm, md, lg
  className = "",
  onValidation = () => {},
  closeOnSelect = true,
  highlightToday = true,
  showClearButton = true,
  position = "bottom", // bottom, top
  weekStartsOn = 1, // 0 = Sunday, 1 = Monday
  disabledDates = [], // Array of disabled date strings
  customValidation = null, // Custom validation function
  yearRange = { start: 1900, end: 2100 }
}) => {
  // Create a date in local timezone without timezone conversion
  const createSafeLocalDate = (year, month, day) => {
    return new Date(year, month, day);
  };

  // Parse input date string - create date in local timezone
  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    let day, month, year;
    
    // Handle different separators
    const separators = ['/', '-', '.'];
    let parts = [];
    let separator = '';
    
    for (const sep of separators) {
      if (dateString.includes(sep)) {
        parts = dateString.split(sep);
        separator = sep;
        break;
      }
    }
    
    if (parts.length !== 3) return null;
    
    switch (format) {
      case 'MM/DD/YYYY':
        [month, day, year] = parts;
        break;
      case 'YYYY-MM-DD':
        [year, month, day] = parts;
        break;
      case 'DD/MM/YYYY':
      default:
        [day, month, year] = parts;
        break;
    }
    
    // Convert to numbers and validate
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return null;
    if (monthNum < 1 || monthNum > 12) return null;
    if (dayNum < 1 || dayNum > 31) return null;
    
    // Create date in local timezone (month is 0-indexed)
    return createSafeLocalDate(yearNum, monthNum - 1, dayNum);
  };

  // Create a date object in local timezone to avoid timezone conversion issues
  const createLocalDate = (dateInput) => {
    if (!dateInput) return null;
    
    if (dateInput instanceof Date) {
      // If it's already a Date object, create a new one with the same local components
      // Use getFullYear, getMonth, getDate to avoid any timezone issues
      const year = dateInput.getFullYear();
      const month = dateInput.getMonth();
      const day = dateInput.getDate();
      return createSafeLocalDate(year, month, day);
    }
    
    if (typeof dateInput === 'string') {
      // If it's a string, parse it carefully to avoid timezone issues
      if (dateInput.includes('T') || dateInput.includes('Z')) {
        // ISO string - extract date components to avoid timezone conversion
        const isoDate = new Date(dateInput);
        const year = isoDate.getUTCFullYear();
        const month = isoDate.getUTCMonth();
        const day = isoDate.getUTCDate();
        return createSafeLocalDate(year, month, day);
      } else if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format - parse manually to avoid timezone issues
        const [year, month, day] = dateInput.split('-').map(Number);
        return createSafeLocalDate(year, month - 1, day);
      } else {
        // Other formats - use parseDate function
        return parseDate(dateInput);
      }
    }
    
    // Fallback - try to create a date but extract local components
    try {
      const fallbackDate = new Date(dateInput);
      if (!isNaN(fallbackDate.getTime())) {
        const year = fallbackDate.getFullYear();
        const month = fallbackDate.getMonth();
        const day = fallbackDate.getDate();
        return createSafeLocalDate(year, month, day);
      }
    } catch (e) {
      console.warn('CustomDatePicker: Invalid date input:', dateInput);
    }
    
    return null;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    // Initialize selectedDate safely
    if (value) {
      try {
        return createLocalDate(value);
      } catch (e) {
        console.warn('CustomDatePicker: Error initializing selectedDate:', e);
        return null;
      }
    }
    return null;
  });
  const [view, setView] = useState('days'); // days, months, years
  const [time, setTime] = useState({ hours: '00', minutes: '00' });
  const [internalError, setInternalError] = useState('');
  
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      input: 'px-3 py-2 text-sm',
      calendar: 'w-72',
      dayCell: 'w-8 h-8 text-sm',
      button: 'px-2 py-1 text-xs'
    },
    md: {
      input: 'px-4 py-3 text-sm',
      calendar: 'w-80',
      dayCell: 'w-10 h-10 text-sm',
      button: 'px-3 py-2 text-sm'
    },
    lg: {
      input: 'px-5 py-4 text-base',
      calendar: 'w-96',
      dayCell: 'w-12 h-12 text-base',
      button: 'px-4 py-2 text-base'
    }
  };

  const config = sizeConfig[size];

  // Format date for display - using local date components to avoid timezone issues
  const formatDate = (date) => {
    if (!date) return '';
    
    // Use the actual date object's local components directly
    const d = date instanceof Date ? date : createLocalDate(date);
    if (!d || isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`;
    }
  };

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Validation
  const validateDate = (date) => {
    if (!date) {
      if (required) return 'Date is required';
      return '';
    }

    if (minDate && date < createLocalDate(minDate)) {
      return `Date must be after ${formatDate(createLocalDate(minDate))}`;
    }

    if (maxDate && date > createLocalDate(maxDate)) {
      return `Date must be before ${formatDate(createLocalDate(maxDate))}`;
    }

    const dateString = formatDate(date);
    if (disabledDates.includes(dateString)) {
      return 'This date is not available';
    }

    if (customValidation) {
      const customError = customValidation(date);
      if (customError) return customError;
    }

    return '';
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    // Create a clean local date to avoid timezone issues
    const cleanDate = createSafeLocalDate(date.getFullYear(), date.getMonth(), date.getDate());
    
    const validationError = validateDate(cleanDate);
    setInternalError(validationError);
    
    if (!validationError) {
      setSelectedDate(cleanDate);
      setCurrentDate(cleanDate);
      
      if (showTime) {
        const finalDate = createSafeLocalDate(cleanDate.getFullYear(), cleanDate.getMonth(), cleanDate.getDate());
        finalDate.setHours(parseInt(time.hours), parseInt(time.minutes));
        onChange(finalDate);
      } else {
        // Create a timezone-safe date that will serialize correctly
        const safeDate = createSafeLocalDate(cleanDate.getFullYear(), cleanDate.getMonth(), cleanDate.getDate());
        safeDate.setHours(12, 0, 0, 0); // Set to noon to prevent timezone shifts
        onChange(safeDate);
      }
      
      onValidation(validationError);
      
      if (closeOnSelect && !showTime) {
        setIsOpen(false);
      }
    }
  };

  // Generate calendar days - FIXED VERSION
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month
    const firstDayOfMonth = createSafeLocalDate(year, month, 1);
    
    // Get what day of the week the first day falls on
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Calculate how many days to go back to start the calendar
    const daysToGoBack = (firstDayWeekday - weekStartsOn + 7) % 7;
    
    // Create the start date by going back the calculated number of days
    const startYear = year;
    const startMonth = month;
    const startDay = 1 - daysToGoBack;
    
    const days = [];
    const today = new Date();
    const todayLocal = createSafeLocalDate(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      // Calculate the actual date for this cell
      const cellDate = createSafeLocalDate(startYear, startMonth, startDay + i);
      
      const isCurrentMonth = cellDate.getMonth() === month;
      const isToday = highlightToday && isSameDay(cellDate, todayLocal);
      const isSelected = selectedDate && isSameDay(cellDate, selectedDate);
      
      const isDisabled = (minDate && cellDate < createLocalDate(minDate)) ||
        (maxDate && cellDate > createLocalDate(maxDate)) ||
        disabledDates.includes(formatDate(cellDate));
      
      days.push({
        date: cellDate,
        day: cellDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled
      });
    }
    
    return days;
  };

  // Generate months
  const generateMonths = () => {
    const months = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    monthNames.forEach((name, index) => {
      const date = createSafeLocalDate(currentDate.getFullYear(), index, 1);
      const isSelected = selectedDate && 
        selectedDate.getMonth() === index && 
        selectedDate.getFullYear() === currentDate.getFullYear();
      
      months.push({
        name,
        index,
        date,
        isSelected
      });
    });
    
    return months;
  };

  // Generate years
  const generateYears = () => {
    const years = [];
    const currentYear = currentDate.getFullYear();
    const startYear = Math.max(yearRange.start, currentYear - 50);
    const endYear = Math.min(yearRange.end, currentYear + 50);
    
    for (let year = startYear; year <= endYear; year++) {
      const isSelected = selectedDate && selectedDate.getFullYear() === year;
      years.push({ year, isSelected });
    }
    
    return years;
  };

  // Navigation handlers
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      return createSafeLocalDate(prev.getFullYear(), prev.getMonth() + direction, 1);
    });
  };

  const navigateYear = (direction) => {
    setCurrentDate(prev => {
      return createSafeLocalDate(prev.getFullYear() + direction, prev.getMonth(), 1);
    });
  };

  // Generate week headers based on weekStartsOn
  const getWeekHeaders = () => {
    const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const reorderedDays = [];
    for (let i = 0; i < 7; i++) {
      reorderedDays.push(allDays[(weekStartsOn + i) % 7]);
    }
    return reorderedDays;
  };

  // Update selected date when value prop changes
  useEffect(() => {
    const newSelectedDate = value ? createLocalDate(value) : null;
    setSelectedDate(newSelectedDate);
    if (newSelectedDate) {
      setCurrentDate(newSelectedDate);
    }
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'Enter':
          if (view === 'days') {
            const today = new Date();
            const todayLocal = createSafeLocalDate(today.getFullYear(), today.getMonth(), today.getDate());
            handleDateSelect(todayLocal);
          }
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, view]);

  const displayError = error || internalError;

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
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
        
        {/* Calendar Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {selectedDate && showClearButton && !disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDate(null);
                onChange(null);
                setInternalError('');
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Calendar className={`h-5 w-5 ${disabled ? 'text-gray-400' : 'text-indigo-500'}`} />
        </div>
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">{displayError}</span>
        </div>
      )}

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className={`
          absolute z-50 ${config.calendar} mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
          ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
        `}>
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

          {/* Calendar Body */}
          <div className="p-4">
            {/* Days View */}
            {view === 'days' && (
              <>
                {/* Week Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {getWeekHeaders().map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((dayInfo, index) => (
                    <button
                      key={index}
                      onClick={() => !dayInfo.isDisabled && handleDateSelect(dayInfo.date)}
                      disabled={dayInfo.isDisabled}
                      className={`
                        ${config.dayCell} flex items-center justify-center rounded-lg transition-all duration-200 font-medium
                        ${!dayInfo.isCurrentMonth 
                          ? 'text-gray-300 dark:text-gray-600' 
                          : 'text-gray-700 dark:text-gray-300'
                        }
                        ${dayInfo.isToday && !dayInfo.isSelected
                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-300 dark:ring-indigo-600'
                          : ''
                        }
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

            {/* Months View */}
            {view === 'months' && (
              <div className="grid grid-cols-3 gap-2">
                {generateMonths().map((month) => (
                  <button
                    key={month.index}
                    onClick={() => {
                      setCurrentDate(month.date);
                      setView('days');
                    }}
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

            {/* Years View */}
            {view === 'years' && (
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {generateYears().map((yearInfo) => (
                  <button
                    key={yearInfo.year}
                    onClick={() => {
                      setCurrentDate(createSafeLocalDate(yearInfo.year, currentDate.getMonth(), 1));
                      setView('days');
                    }}
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

            {/* Time Picker */}
            {showTime && view === 'days' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <select
                    value={time.hours}
                    onChange={(e) => setTime(prev => ({ ...prev, hours: e.target.value }))}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={String(i).padStart(2, '0')}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500">:</span>
                  <select
                    value={time.minutes}
                    onChange={(e) => setTime(prev => ({ ...prev, minutes: e.target.value }))}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={String(i).padStart(2, '0')}>
                        {String(i).padStart(2, '0')}
                      </option>
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
                const todayLocal = createSafeLocalDate(today.getFullYear(), today.getMonth(), today.getDate());
                handleDateSelect(todayLocal);
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
                <Check className="h-3 w-3" />
                Confirm
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;