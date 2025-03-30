import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {Select, SelectContent, SelectTrigger, SelectValue,} from './Select';
import {Button} from './Button';
import toast from 'react-hot-toast';
import {updateGuestCount} from '../../redux/filterSlice';

export interface GuestSelectorProps {
    roomCount: number;
    showDetailedSummary?: boolean; 
    width?: string;  // New prop for width
    height?: string; // New prop for height
}

export const GuestSelector = ({ roomCount, showDetailedSummary = false, width, height }: GuestSelectorProps) => {
    const dispatch = useAppDispatch();
    const guestOptions = useAppSelector(state => state.config.landingConfig?.configData.searchForm.guestOptions);
    const guestCounts = useAppSelector(state => state.roomFilters.guests);
    
   
    
    // Safely access guest counts with fallbacks to 0
    const adults = guestCounts.Adults || 0;
    const teens = guestCounts.Teens || 0;
    const children = guestCounts.Children || 0;
    
    // Initialize guest counts when config is loaded
    useEffect(() => {
        if (guestOptions?.categories) {
            // Check if we need to initialize any categories
            const needsInitialization = guestOptions.categories.some(category => 
                category.enabled && guestCounts[category.name] === undefined
            );
            
            if (needsInitialization) {
                guestOptions.categories.forEach(category => {
                    if (category.enabled && guestCounts[category.name] === undefined) {
                        dispatch(updateGuestCount({
                            category: category.name,
                            count: category.default || 0
                        }));
                    }
                });
            }
        }
    }, [guestOptions, dispatch, guestCounts]);

    // Calculate total guests safely
    const totalGuests = adults + teens + children;

    // Calculate max guests allowed per room - if not defined in config, default to 4
    const maxGuestsPerRoom = 4; // Default value
    const totalMaxGuests = maxGuestsPerRoom * roomCount;

    const handleChange = (categoryName: string, increment: boolean) => {
        if (!guestOptions?.categories) return;

        const category = guestOptions.categories.find(c => c.name === categoryName);
        if (!category?.enabled) return;

        // Check minimum guests requirement for the whole booking
        if (!increment && totalGuests <= (guestOptions.min)) {
            toast.error(`Minimum of ${guestOptions.min} guest required`);
            return;
        }

        // Check if incrementing would exceed the total max guests
        if (increment && totalGuests >= totalMaxGuests) {
            toast.error(`Maximum of ${totalMaxGuests} guests allowed for ${roomCount} room${roomCount > 1 ? 's' : ''}`);
            return;
        }

        // Get current count from Redux state or default to 0
        const currentCount = guestCounts[categoryName] || 0;

        // Check category specific limits
        if (increment && currentCount >= category.max) {
            toast.error(`Maximum of ${category.max} ${category.name.toLowerCase()} allowed`);
            return;
        } else if (!increment && currentCount <= category.min) {
            toast.error(`Minimum of ${category.min} ${category.name.toLowerCase()} required`);
            return;
        }

        // If all checks pass, update the count in Redux
        dispatch(updateGuestCount({
            category: categoryName,
            count: increment ? currentCount + 1 : currentCount - 1
        }));
    };

    // Function to generate summary text based on the display mode
    const getSummaryText = () => {
        // Force detailed summary for debugging
        if (!showDetailedSummary) {
            return `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}`;
        }
        
        // Detailed summary for RoomsListPage
        let summary = '';
        
        if (adults > 0) {
            summary += `${adults} adult${adults > 1 ? 's' : ''}`;
        }
        
        if (teens > 0) {
            summary += summary ? ', ' : '';
            summary += `${teens} teen${teens > 1 ? 's' : ''}`;
        }
        
        if (children > 0) {
            summary += summary ? ', ' : '';
            summary += `${children} child${children > 1 ? 'ren' : ''}`;
        }
        
        return summary || 'Select guests';
    };

    if (!guestOptions?.enabled) return null;
    
    return (
        <div style={{ width: width || '100%' }}>
            <Select>
                <SelectTrigger 
                    className="w-full text-gray-500" 
                    style={{ height: height || '48px', minHeight: height || '48px' }}
                >
                    <SelectValue placeholder={getSummaryText()} />
                </SelectTrigger>
                <SelectContent className="p-4 min-w-[300px]">
                    {guestOptions.categories.map((category) => (
                        category.enabled && (
                            <div key={category.name} className="flex flex-col mb-6 last:mb-2">
                                {/* Counter controls */}
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-base text-[#2F2F2F]">
                                        {category.name}
                                    </span>
                                    <div className="flex items-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 flex items-center justify-center hover:bg-transparent"
                                            onClick={() => handleChange(category.name, false)}
                                        >
                                            <span className="text-lg font-medium">−</span>
                                        </Button>
                                        <span
                                            className="mx-4 text-center min-w-[20px] text-base">{guestCounts[category.name] || 0}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 flex items-center justify-center hover:bg-transparent"
                                            onClick={() => handleChange(category.name, true)}
                                        >
                                            <span className="text-lg font-medium">+</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Age range label below */}
                                <div className="text-xs text-gray-500">
                                    {category.label}
                                </div>
                            </div>
                        )
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
