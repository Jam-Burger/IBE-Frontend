import {Filter, SerializableDateRange, SortOption} from "../types";

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
    // Create a params record first for better manipulation
    const paramsRecord: Record<string, string> = {};

    // Add simple params
    if (filter.propertyId) paramsRecord['propertyId'] = filter.propertyId.toString();
    if (filter.roomCount) paramsRecord['roomCount'] = filter.roomCount.toString();
    if (filter.isAccessible) paramsRecord['isAccessible'] = filter.isAccessible.toString();

    // Add guest counts
    if (filter.guests) {
        // Total guests (sum of all guest types)
        const totalGuests = Object.values(filter.guests).reduce((sum, count) => sum + count, 0);
        if (totalGuests > 0) {
            paramsRecord['totalGuests'] = totalGuests.toString();
        }

        // Individual guest types
        Object.entries(filter.guests).forEach(([type, count]) => {
            if (count > 0) {
                // Sanitize guest type to ensure URL-friendly keys
                const safeType = type;
                paramsRecord[`guest_${safeType}`] = count.toString();
            }
        });
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
 * Extracts the guest type from a parameter key
 */
const extractGuestType = (key: string): string => {
    return key.replace(/^guest_/, '');
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
 * Converts URLSearchParams back to a partial filter object
 */
export const searchParamsToFilter = (params: URLSearchParams): Partial<Filter> => {
    // Convert URLSearchParams to a Record for easier processing
    const paramsRecord: Record<string, string> = {};
    params.forEach((value, key) => {
        paramsRecord[key.toLowerCase()] = value;
    });

    const filter: Partial<Filter> = {};

    // Parse simple params with validation
    const propertyId = validateNumber(paramsRecord.propertyid);
    if (propertyId !== null) filter.propertyId = propertyId;

    const roomCount = validateNumber(paramsRecord.roomcount);
    if (roomCount !== null && roomCount > 0) filter.roomCount = roomCount;

    const isAccessible = validateBoolean(paramsRecord.isaccessible);
    if (isAccessible !== null) filter.isAccessible = isAccessible;

    if (paramsRecord.sortby && Object.values(SortOption).includes(paramsRecord.sortby as SortOption)) {
        filter.sortBy = paramsRecord.sortby as SortOption;
    }

    // Parse guest counts with validation
    const guestEntries: [string, number][] = [];

    // Check for individual guest types (guest_adult, guest_child, etc)
    Object.entries(paramsRecord).forEach(([key, value]) => {
        if (key.startsWith('guest_')) {
            const guestType = extractGuestType(key);
            const count = validateNumber(value);
            if (count !== null && count >= 0) {
                guestEntries.push([guestType, count]);
            }
        }
    });

    // If we found any valid guest entries, create the guests object
    if (guestEntries.length > 0) {
        filter.guests = Object.fromEntries(guestEntries);
    }
    // If we only have totalGuests but no breakdown, use a default structure
    else if (paramsRecord.totalguests) {
        const totalGuests = validateNumber(paramsRecord.totalguests);
        if (totalGuests !== null && totalGuests > 0) {
            filter.guests = {adult: totalGuests}; // Default all guests to adults
        }
    }

    // Parse date range with validation
    if (paramsRecord.datefrom || paramsRecord.dateto) {
        const dateRange: SerializableDateRange = {};
        
        if (paramsRecord.datefrom) {
            const fromDate = sanitizeDate(paramsRecord.datefrom);
            if (fromDate && !isNaN(Date.parse(fromDate))) {
                dateRange.from = fromDate;
            }
        }
        
        if (paramsRecord.dateto) {
            const toDate = sanitizeDate(paramsRecord.dateto);
            if (toDate && !isNaN(Date.parse(toDate))) {
                dateRange.to = toDate;
            }
        }

        if (dateRange.from || dateRange.to) {
            filter.dateRange = dateRange;
        }
    }

    // Parse bed types with validation
    if (paramsRecord.bedtypes) {
        const bedTypesList = paramsRecord.bedtypes.split(',');
        filter.bedTypes = {
            singleBed: bedTypesList.includes('single'),
            doubleBed: bedTypesList.includes('double')
        };
    }

    // Parse arrays with validation
    if (paramsRecord.ratings) {
        const ratings = paramsRecord.ratings.split(',')
            .map(validateNumber)
            .filter((rating): rating is number => rating !== null && rating >= 0 && rating <= 5);
        if (ratings.length > 0) {
            filter.ratings = ratings;
        }
    }

    if (paramsRecord.amenities) {
        // Decode URL-encoded amenity values and filter out empty strings
        const amenities = paramsRecord.amenities.split(',')
            .map(amenity => decodeURIComponent(amenity))
            .filter(amenity => amenity.length > 0);
        if (amenities.length > 0) {
            filter.amenities = amenities;
        }
    }

    // Parse room size range with validation
    if (paramsRecord.roomsizemin || paramsRecord.roomsizemax) {
        const minSize = validateNumber(paramsRecord.roomsizemin);
        const maxSize = validateNumber(paramsRecord.roomsizemax);
        
        if (minSize !== null || maxSize !== null) {
            filter.roomSize = [
                minSize !== null ? minSize : -1,
                maxSize !== null ? maxSize : -1
            ];
        }
    }

    return filter;
};
