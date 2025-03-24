import {useEffect, useState} from 'react';
import {useAppSelector} from '../../redux/hooks';
import {Select, SelectContent, SelectTrigger, SelectValue,} from './Select';
import {Button} from './Button';
import {useTranslation} from 'react-i18next';

interface GuestCount {
    [key: string]: number;
}

interface GuestSelectorProps {
    onChange: (counts: GuestCount) => void;
}

export function GuestSelector({onChange}: Readonly<GuestSelectorProps>) {
    const {t} = useTranslation('hotel');
    const guestOptions = useAppSelector(state => state.config.landingConfig?.configData.searchForm.guestOptions);

    const [counts, setCounts] = useState<GuestCount>({});

    // Initialize guest counts when config is loaded
    useEffect(() => {
        if (guestOptions?.categories) {
            setCounts(
                guestOptions.categories.reduce((acc, category) => {
                    if (category.enabled) {
                        acc[category.name] = category.default || 0;
                    }
                    return acc;
                }, {} as GuestCount)
            );
        }
    }, [guestOptions]);

    const handleChange = (categoryName: string, increment: boolean) => {
        if (!guestOptions?.categories) return;

        const category = guestOptions.categories.find(c => c.name === categoryName);
        if (!category?.enabled) return;

        const newCounts = {...counts};
        if (increment && newCounts[categoryName] < category.max) {
            newCounts[categoryName]++;
        } else if (!increment && newCounts[categoryName] > category.min) {
            newCounts[categoryName]--;
        }

        setCounts(newCounts);
        onChange(newCounts);
    };

    const totalGuests = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (!guestOptions?.enabled) return null;

    return (
        <Select>
            <SelectTrigger
                className="w-full px-[1.1875rem] py-[0.75rem] !h-[3rem] text-[#858685] rounded-[0.25rem] border border-gray-300"
            >
                <SelectValue
                    placeholder={totalGuests > 0 ?
                        `${totalGuests} ${totalGuests === 1 ? t('guest') : t('guests')}` :
                        t('guests')}
                    style={{fontStyle: 'italic', color: '#2F2F2F', fontWeight: 'normal'}}
                />
            </SelectTrigger>
            <SelectContent className="p-4 min-w-[300px]">
                {guestOptions.categories.map((category) => (
                    category.enabled && (
                        <div key={category.name} className="flex flex-col mb-6 last:mb-2">
                            {/* Counter controls */}
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-base text-[#2F2F2F]">
                                    {t(category.name)}
                                </span>
                                <div className="flex items-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 flex items-center justify-center hover:bg-transparent"
                                        onClick={() => handleChange(category.name, false)}
                                        disabled={counts[category.name] <= category.min}
                                    >
                                        <span className="text-lg font-medium">−</span>
                                    </Button>
                                    <span
                                        className="mx-4 text-center min-w-[20px] text-base">{counts[category.name] || 0}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 flex items-center justify-center hover:bg-transparent"
                                        onClick={() => handleChange(category.name, true)}
                                        disabled={counts[category.name] >= category.max}
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
    );
}
