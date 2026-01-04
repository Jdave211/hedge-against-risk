import * as React from "react";
import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const locations = [
  // Major Cities
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "Fort Worth, TX",
  "Columbus, OH",
  "Charlotte, NC",
  "San Francisco, CA",
  "Indianapolis, IN",
  "Seattle, WA",
  "Denver, CO",
  "Boston, MA",
  "Nashville, TN",
  "Portland, OR",
  "Las Vegas, NV",
  "Detroit, MI",
  "Memphis, TN",
  "Louisville, KY",
  "Baltimore, MD",
  "Milwaukee, WI",
  "Albuquerque, NM",
  "Tucson, AZ",
  "Fresno, CA",
  "Sacramento, CA",
  "Atlanta, GA",
  "Miami, FL",
  "Orlando, FL",
  "Tampa, FL",
  "Minneapolis, MN",
  "Cleveland, OH",
  "Pittsburgh, PA",
  "St. Louis, MO",
  "Kansas City, MO",
  "Salt Lake City, UT",
  "Raleigh, NC",
  "Richmond, VA",
  "New Orleans, LA",
  "Honolulu, HI",
  "Anchorage, AK",
  // Regions
  "Northeast US",
  "Southeast US",
  "Midwest US",
  "Southwest US",
  "West Coast",
  "Pacific Northwest",
  "Mountain West",
  "Gulf Coast",
  "New England",
  "Mid-Atlantic",
];

interface LocationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function LocationCombobox({
  value,
  onChange,
  placeholder = "Search for your location...",
}: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start text-left font-normal h-12 bg-background border-border hover:bg-muted/50"
        >
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
          {value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-popover border border-border shadow-lg" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={(search) => {
              setInputValue(search);
            }}
          />
          <CommandList>
            <CommandEmpty>
              {inputValue.length > 0 ? (
                <CommandItem
                  onSelect={() => {
                    onChange(inputValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <span>Use "{inputValue}"</span>
                </CommandItem>
              ) : (
                <span className="text-muted-foreground text-sm p-2">Start typing to search...</span>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredLocations.map((location) => (
                <CommandItem
                  key={location}
                  value={location}
                  onSelect={() => {
                    onChange(location);
                    setInputValue(location);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === location ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {location}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
