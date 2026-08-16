import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * AutocompleteInput
 * A reusable text input with a floating dropdown for smart autocomplete suggestions.
 * Follows LifeOS design system: sharp corners (rounded-none), custom tokens, keyboard accessible.
 */
export default function AutocompleteInput({
  label,
  value = '',
  onChange,
  suggestions = [],
  placeholder = '',
  disabled = false,
  autoFocus = false,
  required = false,
  className = '',
  maxSuggestions = 8,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter and prioritize suggestions
  const filteredSuggestions = useMemo(() => {
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return [];
    }

    const query = (value || '').trim().toLowerCase();

    if (!query) {
      // Return top recent suggestions when empty
      return suggestions.slice(0, maxSuggestions);
    }

    // Split into prefix matches and substring matches
    const prefixMatches = [];
    const containsMatches = [];

    for (const item of suggestions) {
      if (typeof item !== 'string') continue;
      const normalizedItem = item.toLowerCase();
      
      if (normalizedItem.startsWith(query)) {
        prefixMatches.push(item);
      } else if (normalizedItem.includes(query)) {
        containsMatches.push(item);
      }
    }

    // Prefix matches come first, followed by other partial matches
    return [...prefixMatches, ...containsMatches].slice(0, maxSuggestions);
  }, [suggestions, value, maxSuggestions]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (item) => {
    if (onChange) {
      onChange({ target: { value: item } });
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else if (filteredSuggestions.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % filteredSuggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen && filteredSuggestions.length > 0) {
        setHighlightedIndex((prev) => 
          prev <= 0 ? filteredSuggestions.length - 1 : prev - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        e.preventDefault();
        e.stopPropagation();
        handleSelect(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          required={required}
          autoComplete="off"
          className={`w-full px-3 py-2 border border-border bg-surface text-primary rounded-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <ul 
          className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-none shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-border/50"
          role="listbox"
        >
          {filteredSuggestions.map((item, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={`${item}-${index}`}
                role="option"
                aria-selected={isHighlighted}
                // Use onMouseDown with preventDefault so input doesn't lose focus before selection
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                  isHighlighted 
                    ? 'bg-slate-100 text-accent font-medium' 
                    : 'text-primary hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{item}</span>
                <span className="text-[10px] text-muted uppercase tracking-wider ml-2 shrink-0">
                  saved
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
