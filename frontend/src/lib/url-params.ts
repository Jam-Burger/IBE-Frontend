import {Filter, RoomsListConfig, SerializableDateRange, SortOption} from "../types";

/**
 * Sanitizes date strings by removing time components and trimming
 */
const sanitizeDate = (dateStr: string): string => {
    // Extract only the date part before any time component (like T or :)
    const dateOnly = dateStr.split(/[T:]/, 1)[0];
    return dateOnly.trim();
};

/**
 * Converts a filter object to URLSearchParams for use in the URL
 */
export const filterToSearchParams = (filter: Filter): URLSearchParams => {
    const paramsRecord: Record<string, string> = {};

    // Add simple params
    if (filter.propertyId) paramsRecord['propertyId'] = filter.propertyId.toString();
    if (filter.roomCount) paramsRecord['roomCount'] = filter.roomCount.toString();
    if (filter.bedCount) paramsRecord['bedCount'] = filter.roomCount.toString();
    if (filter.isAccessible) paramsRecord['isAccessible'] = filter.isAccessible.toString();

    // Add guest counts with preserved case
    if (filter.guests) {
        // Total guests (sum of all guest types)
        const totalGuests = Object.values(filter.guests).reduce((sum, count) => sum + count, 0);
        if (totalGuests > 0) {
            paramsRecord['totalGuests'] = totalGuests.toString();

            // Individual guest types with preserved case
            Object.entries(filter.guests).forEach(([type, count]) => {
                if (count > 0) {
                    // Use the exact case from the type
                    paramsRecord[`guest_${type}`] = count.toString();
                }
            });
        }
    }

    if (filter.sortBy) paramsRecord['sortBy'] = filter.sortBy;

    // Add date range if it exists - ensure they're properly formatted strings with time components removed
    if (filter.dateRange?.from) paramsRecord['dateFrom'] = sanitizeDate(String(filter.dateRange.from));
    if (filter.dateRange?.to) paramsRecord['dateTo'] = sanitizeDate(String(filter.dateRange.to));

    // Add bed types as an array of selected types
    const selectedBedTypes = [];
    if (filter.bedTypes.singleBed) selectedBedTypes.push('single');
    if (filter.bedTypes.doubleBed) selectedBedTypes.push('double');
    if (selectedBedTypes.length > 0) {
        paramsRecord['bedTypes'] = selectedBedTypes.join(',');
    }

    // Add arrays - ensure proper serialization for complex values
    if (filter.ratings.length) paramsRecord['ratings'] = filter.ratings.join(',');
    if (filter.amenities.length) {
        paramsRecord['amenities'] = filter.amenities.join(',');
    }

    // Add room size range
    if (filter.roomSize[0] || filter.roomSize[1]) {
        paramsRecord['roomSizeMin'] = filter.roomSize[0].toString();
        paramsRecord['roomSizeMax'] = filter.roomSize[1].toString();
    }

    // Convert record to URLSearchParams with sanitized keys and values
    const params = new URLSearchParams();
    Object.entries(paramsRecord).forEach(([key, value]) => {
        const safeKey = key;
        const safeValue = String(value);
        params.append(safeKey, safeValue);
    });

    return params;
};

/**
 * Extracts the guest type from a parameter key while preserving case
 */
const extractGuestType = (key: string): string => {
    const match = key.match(/^guest_(.+)$/);
    return match ? match[1] : '';
};

/**
 * Validates a number parameter
 */
const validateNumber = (value: string): number | null => {
    const num = Number(value);
    return isNaN(num) ? null : num;
};

/**
 * Validates a boolean parameter
 */
const validateBoolean = (value: string): boolean | null => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
};

/**
 * Validates if a date is not in the past (comparing only dates, not time)
 */
const isNotPastDate = (dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date >= today;
};

/**
 * Validates if start date is before or equal to end date
 */
const isValidDateRange = (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return start <= end;
};

/**
 * Converts URLSearchParams back to a partial filter object
 */
export const searchParamsToFilter = (params: URLSearchParams, roomsListConfig: RoomsListConfig): Partial<Filter> => {
    const paramsRecord: Record<string, string> = {};
    params.forEach((value, key) => {
        paramsRecord[key] = value;
    });

    const filter: Partial<Filter> = {};
    const {configData} = roomsListConfig;

    // Parse simple params with validation
    const propertyId = validateNumber(paramsRecord.propertyId);
    if (propertyId !== null && propertyId > 0) filter.propertyId = propertyId;

    // Validate room count against bedCount config
    const roomCount = validateNumber(paramsRecord.roomCount);
    if (roomCount !== null &&
        configData.filters.filterGroups.bedCount.enabled &&
        roomCount >= configData.filters.filterGroups.bedCount.min &&
        roomCount <= configData.filters.filterGroups.bedCount.max) {
        filter.roomCount = roomCount;
    }

    const bedCount = validateNumber(paramsRecord.bedCount);
    if (bedCount !== null &&
        configData.filters.filterGroups.bedCount.enabled &&
        bedCount >= configData.filters.filterGroups.bedCount.min &&
        bedCount <= configData.filters.filterGroups.bedCount.max) {
        filter.bedCount = bedCount;
    }

    const isAccessible = validateBoolean(paramsRecord.isAccessible);
    if (isAccessible !== null) filter.isAccessible = isAccessible;

    // Validate sort option against config
    const sortBy = paramsRecord.sortBy || paramsRecord.sortby;
    if (sortBy && configData.filters.sortOptions.enabled) {
        const validSortOption = configData.filters.sortOptions.options.find(
            option => option.enabled && option.value === sortBy
        );
        if (validSortOption) {
            filter.sortBy = sortBy as SortOption;
        } else {
            // Use default sort option from config
            filter.sortBy = configData.filters.sortOptions.default;
        }
    }

    // Parse guest counts with validation
    const guestEntries: [string, number][] = [];
    const totalGuests = validateNumber(paramsRecord.totalGuests);

    // Check for individual guest types
    Object.entries(paramsRecord).forEach(([key, value]) => {
        if (key.toLowerCase().startsWith('guest_')) {
            const guestType = extractGuestType(key);
            const count = validateNumber(value);
            if (guestType && count !== null && count >= 0) {
                guestEntries.push([guestType, count]);
            }
        }
    });

    // Set guests based on valid entries or total guests
    if (guestEntries.length > 0) {
        filter.guests = Object.fromEntries(guestEntries);
    } else if (totalGuests !== null && totalGuests > 0) {
        filter.guests = {Adult: totalGuests};
    }

    // Parse date range with validation
    if (paramsRecord.dateFrom || paramsRecord.dateTo) {
        const dateRange: SerializableDateRange = {};
        let fromDate: string | null = null;
        let toDate: string | null = null;

        if (paramsRecord.dateFrom) {
            const sanitizedFromDate = sanitizeDate(paramsRecord.dateFrom);
            if (sanitizedFromDate && !isNaN(Date.parse(sanitizedFromDate))) {
                if (isNotPastDate(sanitizedFromDate)) {
                    fromDate = sanitizedFromDate;
                }
            }
        }

        if (paramsRecord.dateTo) {
            const sanitizedToDate = sanitizeDate(paramsRecord.dateTo);
            if (sanitizedToDate && !isNaN(Date.parse(sanitizedToDate))) {
                if (isNotPastDate(sanitizedToDate)) {
                    toDate = sanitizedToDate;
                }
            }
        }

        if (fromDate && toDate) {
            if (isValidDateRange(fromDate, toDate)) {
                dateRange.from = fromDate;
                dateRange.to = toDate;
            }
        } else {
            if (fromDate) dateRange.from = fromDate;
            if (toDate) dateRange.to = toDate;
        }

        if (dateRange.from || dateRange.to) {
            filter.dateRange = dateRange;
        }
    }

    // Parse bed types with config validation
    if (paramsRecord.bedTypes && configData.filters.filterGroups.bedTypes.enabled) {
        const bedTypesList = paramsRecord.bedTypes.split(',');
        filter.bedTypes = {
            singleBed: bedTypesList.includes('single'),
            doubleBed: bedTypesList.includes('double')
        };
    }

    // Parse ratings with config validation
    if (paramsRecord.ratings && configData.filters.filterGroups.ratings.enabled) {
        const ratings = paramsRecord.ratings.split(',')
            .map(validateNumber)
            .filter((rating): rating is number => {
                if (rating === null) return false;
                // Check if rating is valid according to config
                return configData.filters.filterGroups.ratings.options.some(
                    option => option.enabled && option.value === rating
                );
            });
        if (ratings.length > 0) {
            filter.ratings = ratings;
        }
    }

    // Parse amenities with config validation
    if (paramsRecord.amenities && configData.filters.filterGroups.amenities.enabled) {
        const amenities = paramsRecord.amenities.split(',')
            .map(amenity => decodeURIComponent(amenity))
            .filter(amenity => amenity.length > 0);
        if (amenities.length > 0) {
            filter.amenities = amenities;
        }
    }

    // Parse room size with config validation
    if ((paramsRecord.roomSizeMin || paramsRecord.roomSizeMax) &&
        configData.filters.filterGroups.roomSize.enabled) {
        const minSize = validateNumber(paramsRecord.roomSizeMin);
        const maxSize = validateNumber(paramsRecord.roomSizeMax);

        const configMin = configData.filters.filterGroups.roomSize.min;
        const configMax = configData.filters.filterGroups.roomSize.max;

        if (minSize !== null || maxSize !== null) {
            filter.roomSize = [
                minSize !== null && minSize >= configMin && minSize <= configMax ? minSize : configMin,
                maxSize !== null && maxSize <= configMax && maxSize >= configMin ? maxSize : configMax
            ];
        }
    }

    return filter;
};
