"use client";

import { Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getYearOptions } from "@/lib/mock-data";
import useSWR from "swr";
import { FlixBrowseFilters, FlixGenre } from "@/types/flix";
import { clientFetchFlixGenres } from "@/lib/flix-api.client";

interface BrowseFiltersProps {
  filters: FlixBrowseFilters;
  onFiltersChange: (filters: Partial<FlixBrowseFilters>) => void;
  onReset: () => void;
}
const sortOptions = [
  { value: "-date_upload", label: "Newest Upload" },
  { value: "date_upload", label: "Oldest Upload" },
  { value: "-date_release", label: "Newest Release" },
  { value: "date_release", label: "Oldest Release" },
  { value: "title", label: "Title A-Z" },
  { value: "-title", label: "Title Z-A" },
];

export function BrowseFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
}: BrowseFiltersProps) {
  const yearOptions = getYearOptions();
  const [searchValue, setSearchValue] = useState(filters.query);

  const defferredSearchValue = useDeferredValue(searchValue);

  useEffect(() => {
    onFiltersChange({ query: defferredSearchValue, page: 1 });
  }, [defferredSearchValue]);

  const hasActiveFilters =
    filters.query ||
    filters.type !== "all" ||
    filters.genre !== null ||
    filters.sort_by !== "-date_upload" ||
    filters.year !== null;
  
  const { data: flixGenres = [] } = useSWR<FlixGenre[]>("genres", clientFetchFlixGenres);

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search movies and series..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 bg-secondary/50"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type Filter */}
        <Select
          value={filters.type}
          onValueChange={(value: FlixBrowseFilters["type"]) =>
            onFiltersChange({ type: value, page: 1 })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="movie">Movies</SelectItem>
            <SelectItem value="series">Series</SelectItem>
          </SelectContent>
        </Select>

        {/* Genre Filter */}
        <Select
          value={filters.genre?.toString() || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              genre: value === "all" ? null : parseInt(value),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {flixGenres.map((genre) => (
              <SelectItem key={genre.tmdb_id} value={genre.tmdb_id.toString()}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sort_by}
          onValueChange={(value) => onFiltersChange({ sort_by: value, page: 1 })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Filter */}
        {/* <Select
          value={filters.year?.toString() || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              year: value === "all" ? null : parseInt(value),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {yearOptions.slice(0, 50).map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
