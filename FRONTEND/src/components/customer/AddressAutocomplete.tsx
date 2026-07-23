import React, { useState, useEffect, useRef } from 'react';

interface LocationSuggestionDto {
    placeId: string;
    mainText: string;
    fullAddress: string;
    lat?: number;
    lng?: number;
    source: string;
}

interface AddressAutocompleteProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    onSelect: (address: string, lat?: number, lng?: number) => void;
    icon?: string;
    iconBgClass?: string;
    iconTextClass?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    label,
    placeholder,
    value,
    onChange,
    onSelect,
    icon = 'location_on',
    iconBgClass = 'bg-slate-100',
    iconTextClass = 'text-slate-500'
}) => {
    const [suggestions, setSuggestions] = useState<LocationSuggestionDto[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!value || value.length < 2) {
                setSuggestions([]);
                setHasSearched(false);
                return;
            }
            setIsLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5184/api';
                const response = await fetch(`${API_URL}/locations/suggestions?keyword=${encodeURIComponent(value)}`);
                const data = await response.json();
                if (data.success) {
                    setSuggestions(data.data);
                    setHasSearched(true);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
                setHasSearched(true);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (isOpen) {
                fetchSuggestions();
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [value, isOpen]);

    const handleSelect = async (suggestion: LocationSuggestionDto) => {
        onChange(suggestion.fullAddress || suggestion.mainText);
        setIsOpen(false);

        // Fetch detail if needed, or use existing lat/lng if provided (like from mock)
        if (suggestion.lat && suggestion.lng) {
            onSelect(suggestion.fullAddress || suggestion.mainText, suggestion.lat, suggestion.lng);
        } else {
            // Need to fetch details (Google mode)
            try {
                const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5184/api';
                const response = await fetch(`${API_URL}/locations/place-detail?placeId=${suggestion.placeId}`);
                const data = await response.json();
                if (data.success && data.data) {
                    onSelect(data.data.fullAddress || data.data.mainText, data.data.lat, data.data.lng);
                } else {
                    onSelect(suggestion.fullAddress || suggestion.mainText);
                }
            } catch (error) {
                console.error("Error fetching place detail:", error);
                onSelect(suggestion.fullAddress || suggestion.mainText);
            }
        }
    };

    return (
        <div className="space-y-1 relative" ref={wrapperRef}>
            <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">{label}</label>
            <div className="relative">
                <textarea 
                    className={`w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-${iconTextClass.split('-')[1] || 'purple'}-500/20 outline-none resize-none`}
                    placeholder={placeholder}
                    rows={2}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                ></textarea>
                
                {isLoading && (
                    <div className="absolute top-4 right-4">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {isOpen && (suggestions.length > 0 || isLoading || hasSearched) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {isLoading && (
                        <div className="px-4 py-3 text-sm font-semibold text-slate-500">
                            Đang tìm địa chỉ...
                        </div>
                    )}

                    {!isLoading && suggestions.length === 0 && hasSearched && (
                        <div className="px-4 py-3 text-sm font-semibold text-slate-500">
                            Không tìm thấy địa chỉ phù hợp. Bạn có thể nhập thủ công.
                        </div>
                    )}

                    {!isLoading && suggestions.map((suggestion) => (
                        <div 
                            key={suggestion.placeId} 
                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0"
                            onClick={() => handleSelect(suggestion)}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`material-symbols-outlined text-[18px] p-1.5 rounded-lg ${iconBgClass} ${iconTextClass}`}>
                                    {icon}
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-800 text-[14px]">{suggestion.mainText}</p>
                                    <p className="text-slate-500 text-[12px] mt-0.5">{suggestion.fullAddress}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
