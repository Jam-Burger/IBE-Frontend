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
 * Converts URLSearchParams back to a partial filter object
 */
export const searchParamsToFilter = (params: URLSearchParams): Partial<Filter> => {
    // Convert URLSearchParams to a Record for easier processing
    const paramsRecord: Record<string, string> = {};
    params.forEach((value, key) => {
        paramsRecord[key] = value;
    });

    const filter: Partial<Filter> = {};

    // Parse simple params
    if ('propertyid' in paramsRecord) filter.propertyId = Number(paramsRecord.propertyid);
    if ('roomcount' in paramsRecord) filter.roomCount = Number(paramsRecord.roomcount);
    if ('isaccessible' in paramsRecord) filter.isAccessible = paramsRecord.isaccessible === 'true';
    if ('sortby' in paramsRecord) filter.sortBy = paramsRecord.sortby as SortOption;

    // Parse guest counts
    const guestEntries: [string, number][] = [];

    // Check for individual guest types (guest_adult, guest_child, etc)
    Object.entries(paramsRecord).forEach(([key, value]) => {
        if (key.startsWith('guest_')) {
            const guestType = extractGuestType(key);
            guestEntries.push([guestType, Number(value)]);
        }
    });

    // If we found any guest entries, create the guests object
    if (guestEntries.length > 0) {
        filter.guests = Object.fromEntries(guestEntries);
    }
    // If we only have totalGuests but no breakdown, use a default structure
    else if ('totalguests' in paramsRecord) {
        const totalGuests = Number(paramsRecord.totalguests);
        filter.guests = {adult: totalGuests}; // Default all guests to adults
    }

    // Parse date range - clean date strings
    if ('datefrom' in paramsRecord || 'dateto' in paramsRecord) {
        const dateRange: SerializableDateRange = {};
        if ('datefrom' in paramsRecord) dateRange.from = sanitizeDate(paramsRecord.datefrom);
        if ('dateto' in paramsRecord) dateRange.to = sanitizeDate(paramsRecord.dateto);
        filter.dateRange = dateRange;
    }

    // Parse bed types from comma-separated list
    if ('bedtypes' in paramsRecord) {
        const bedTypesList = paramsRecord.bedtypes.split(',');
        filter.bedTypes = {
            singleBed: bedTypesList.includes('single'),
            doubleBed: bedTypesList.includes('double')
        };
    }

    // Parse arrays
    if ('ratings' in paramsRecord) {
        filter.ratings = paramsRecord.ratings.split(',').map(Number);
    }

    if ('amenities' in paramsRecord) {
        // Decode URL-encoded amenity values
        filter.amenities = paramsRecord.amenities.split(',').map(amenity =>
            decodeURIComponent(amenity)
        );
    }

    // Parse room size range
    if ('roomsizemin' in paramsRecord && 'roomsizemax' in paramsRecord) {
        filter.roomSize = [
            Number(paramsRecord.roomsizemin),
            Number(paramsRecord.roomsizemax)
        ];
    }

    return filter;
};
