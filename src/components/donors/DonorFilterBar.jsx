import { RotateCcw, Search } from 'lucide-react';
import {
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
  getProvinceNames,
} from '../../data/locations';
import { BLOOD_GROUPS } from '../../utils/bloodCompatibility';
import { Button, SelectField, Surface } from '../common/ui';

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'All availability states' },
  { value: 'Available Now', label: 'Available Now' },
  { value: 'Weekends & Evenings', label: 'Weekends & Evenings' },
  { value: 'Emergency Only', label: 'Emergency Only' },
];

const SORT_OPTIONS = [
  { value: 'availability', label: 'Sort: Immediate availability first' },
  { value: 'district_asc', label: 'Sort: District (A–Z)' },
  { value: 'province_asc', label: 'Sort: Province (A–Z)' },
  { value: 'blood_group', label: 'Sort: Blood group' },
];

export default function DonorFilterBar({
  filters,
  onChangeFilter,
  onClearFilters,
  resultCount,
}) {
  const provinces = getProvinceNames();
  const districts = getDistrictsByProvince(filters.province);
  const municipalities = getMunicipalitiesByDistrict(filters.province, filters.district);

  const hasActiveFilters = Boolean(
    filters.query ||
      filters.bloodGroup ||
      filters.province ||
      filters.district ||
      filters.municipality ||
      filters.availability ||
      filters.sortBy !== 'availability'
  );

  return (
    <Surface className="p-5">
      <div className="space-y-4">
        {/* Blood group quick filter chips */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted">Filter by blood group</span>
            <span className="text-xs tabular-nums text-subtle">
              {resultCount} matching voluntary donor{resultCount === 1 ? '' : 's'}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChangeFilter('bloodGroup', '')}
              className={`min-h-9 rounded-control border px-3 text-xs font-medium transition-colors ${
                !filters.bloodGroup
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-foreground hover:bg-background'
              }`}
            >
              All groups
            </button>
            {BLOOD_GROUPS.map((group) => {
              const active = filters.bloodGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => onChangeFilter('bloodGroup', active ? '' : group)}
                  className={`min-h-9 min-w-11 rounded-control border px-3 text-xs font-semibold tabular-nums transition-colors ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-surface text-foreground hover:bg-background'
                  }`}
                >
                  {group}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & cascading administrative location filters */}
        <div className="grid grid-cols-1 gap-3 border-t border-border/50 pt-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="min-w-0 space-y-1.5 lg:col-span-2">
            <label htmlFor="donor-search-input" className="block text-sm font-medium text-foreground">
              Search name or location
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-subtle" />
              <input
                id="donor-search-input"
                type="search"
                value={filters.query}
                onChange={(e) => onChangeFilter('query', e.target.value)}
                placeholder="Search donor first name, district, or city..."
                className="min-h-11 w-full rounded-control border border-border bg-surface pr-3.5 pl-9 text-sm text-foreground placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-primary"
              />
            </div>
          </div>

          <SelectField
            label="Province"
            value={filters.province}
            onChange={(e) => {
              onChangeFilter('province', e.target.value);
              onChangeFilter('district', '');
              onChangeFilter('municipality', '');
            }}
            placeholder="All 7 provinces"
            options={provinces}
          />

          <SelectField
            label="District"
            value={filters.district}
            onChange={(e) => {
              onChangeFilter('district', e.target.value);
              onChangeFilter('municipality', '');
            }}
            placeholder="All districts"
            options={districts}
          />

          <SelectField
            label="Municipality"
            value={filters.municipality}
            disabled={!filters.district}
            onChange={(e) => onChangeFilter('municipality', e.target.value)}
            placeholder={filters.district ? 'All municipalities' : 'Select district first'}
            options={municipalities}
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border/50 pt-4">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-2">
            <SelectField
              label="Availability preference"
              value={filters.availability}
              onChange={(e) => onChangeFilter('availability', e.target.value)}
              options={AVAILABILITY_OPTIONS}
            />
            <SelectField
              label="Sort order"
              value={filters.sortBy}
              onChange={(e) => onChangeFilter('sortBy', e.target.value)}
              options={SORT_OPTIONS}
            />
          </div>

          {hasActiveFilters && (
            <Button tone="quiet" size="sm" onClick={onClearFilters}>
              <RotateCcw className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </Surface>
  );
}
