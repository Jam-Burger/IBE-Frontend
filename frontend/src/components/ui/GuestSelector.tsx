import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { 
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from './select';
import { Button } from './button';

interface GuestCount {
  [key: string]: number;
}

interface GuestSelectorProps {
  onChange: (counts: GuestCount) => void;
}

export function GuestSelector({ onChange }: GuestSelectorProps) {
    const config = useSelector((state: RootState) => state.config.landingConfig?.data?.configData?.searchForm);
  const guestOptions = config?.guestOptions;
  
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
    if (!category || !category.enabled) return;

    const newCounts = { ...counts };
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
          placeholder={totalGuests > 0 ? `${totalGuests} Guest${totalGuests !== 1 ? 's' : ''}` : "Guests"} 
          style={{ fontStyle: 'italic', color: '#2F2F2F', fontWeight: 'normal' }}
        />
      </SelectTrigger>
      <SelectContent className="p-3">
        {guestOptions.categories.map((category) => (
          category.enabled && (
            <div key={category.name} className="flex items-center justify-between py-2 px-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#2F2F2F]">
                  {category.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={() => handleChange(category.name, false)}
                  disabled={counts[category.name] <= category.min}
                >
                  -
                </Button>
                <span className="w-4 text-center">{counts[category.name] || 0}</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={() => handleChange(category.name, true)}
                  disabled={counts[category.name] >= category.max}
                >
                  +
                </Button>
              </div>
            </div>
          )
        ))}
      </SelectContent>
    </Select>
  );
}
