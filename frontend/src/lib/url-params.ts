import {Filter, SortOption} from "../types";

/**
 * Converts a filter object to URLSearchParams for use in the URL
 */
export const filterToSearchParams = (filter: Filter): URLSearchParams => {
    const params = new URLSearchParams();

    // Add simple params
    if (filter.propertyId) params.set('propertyId', filter.propertyId.toString());
    if (filter.roomCount) params.set('roomCount', filter.roomCount.toString());
    if (filter.isAccessible) params.set('isAccessible', filter.isAccessible.toString());

    // Add guest counts
    if (filter.guests) {
        // Total guests (sum of all guest types)
        const totalGuests = Object.values(filter.guests).reduce((sum, count) => sum + count, 0);
        if (totalGuests > 0) {
            params.set('totalGuests', totalGuests.toString());
        }

        // Individual guest types
        Object.entries(filter.guests).forEach(([type, count]) => {
            if (count > 0) {
                params.set(`guest_${type}`, count.toString());
            }
        });
    }

    if (filter.sortBy) params.set('sortBy', filter.sortBy);

    // Add date range if it exists
    if (filter.dateRange?.from) params.set('dateFrom', filter.dateRange.from.toISOString());
    if (filter.dateRange?.to) params.set('dateTo', filter.dateRange.to.toISOString());

    // Add bed types - simplified to just use the value that's true
    if (filter.bedTypes.singleBed || filter.bedTypes.doubleBed) {
        params.set('bedType', filter.bedTypes.singleBed ? 'single' : 'double');
    }

    // Add arrays
    if (filter.ratings.length) params.set('ratings', filter.ratings.join(','));
    if (filter.amenities.length) params.set('amenities', filter.amenities.join(','));

    // Add room size range
    if (filter.roomSize[0] || filter.roomSize[1]) {
        params.set('roomSizeMin', filter.roomSize[0].toString());
        params.set('roomSizeMax', filter.roomSize[1].toString());
    }

    return params;
};

/**
 * Converts URLSearchParams back to a partial filter object
 */
export const searchParamsToFilter = (params: URLSearchParams): Partial<Filter> => {
    const filter: Partial<Filter> = {};

    // Parse simple params
    if (params.has('propertyId')) filter.propertyId = Number(params.get('propertyId'));
    if (params.has('roomCount')) filter.roomCount = Number(params.get('roomCount'));
    if (params.has('isAccessible')) filter.isAccessible = params.get('isAccessible') === 'true';

    // Parse guest counts
    const guestEntries: [string, number][] = [];

    // Check for individual guest types (guest_adult, guest_child, etc)
    Array.from(params.entries()).forEach(([key, value]) => {
        if (key.startsWith('guest_')) {
            const guestType = key.replace('guest_', '');
            guestEntries.push([guestType, Number(value)]);
        }
    });

    // If we found any guest entries, create the guests object
    if (guestEntries.length > 0) {
        filter.guests = Object.fromEntries(guestEntries);
    }
    // If we only have totalGuests but no breakdown, use a default structure
    else if (params.has('totalGuests')) {
        const totalGuests = Number(params.get('totalGuests'));
        filter.guests = {adult: totalGuests}; // Default all guests to adults
    }

    if (params.has('sortBy')) filter.sortBy = params.get('sortBy') as SortOption;

    // Parse date range
    if (params.has('dateFrom') || params.has('dateTo')) {
        filter.dateRange = {
            from: params.has('dateFrom') ? new Date(params.get('dateFrom')!) : undefined,
            to: params.has('dateTo') ? new Date(params.get('dateTo')!) : undefined
        };
    }

    // Parse bed types - simplified to one parameter
    if (params.has('bedType')) {
        const bedType = params.get('bedType');
        filter.bedTypes = {
            singleBed: bedType === 'single',
            doubleBed: bedType === 'double'
        };
    }

    // Parse arrays
    if (params.has('ratings')) {
        filter.ratings = params.get('ratings')!.split(',').map(Number);
    }

    if (params.has('amenities')) {
        filter.amenities = params.get('amenities')!.split(',');
    }

    // Parse room size range
    if (params.has('roomSizeMin') && params.has('roomSizeMax')) {
        filter.roomSize = [
            Number(params.get('roomSizeMin')),
            Number(params.get('roomSizeMax'))
        ];
    }

    return filter;
}; 