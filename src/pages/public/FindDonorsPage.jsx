import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NepalLocatorMap from '../../components/common/NepalLocatorMap';
import Pagination from '../../components/common/Pagination';
import { EmptyState, Surface } from '../../components/common/ui';
import DonorCard from '../../components/donors/DonorCard';
import DonorFilterBar from '../../components/donors/DonorFilterBar';
import { usePagination } from '../../hooks/usePagination';
import { usePlatformData } from '../../hooks/usePlatformData';

const AVAILABILITY_RANK = {
  'Available Now': 1,
  'Weekends & Evenings': 2,
  'Emergency Only': 3,
  'Temporarily Paused': 4,
};

export default function FindDonorsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { donors, hospitals } = usePlatformData();

  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    bloodGroup: searchParams.get('bloodGroup') || '',
    province: searchParams.get('province') || '',
    district: searchParams.get('district') || '',
    municipality: searchParams.get('municipality') || '',
    availability: '',
    sortBy: 'availability',
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      bloodGroup: '',
      province: '',
      district: '',
      municipality: '',
      availability: '',
      sortBy: 'availability',
    });
  };

  const filteredDonors = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const matched = donors.filter((donor) => {
      if (filters.bloodGroup && donor.bloodGroup !== filters.bloodGroup) return false;
      if (filters.province && donor.province !== filters.province) return false;
      if (filters.district && donor.district !== filters.district) return false;
      if (filters.municipality) {
        if (!donor.shareMunicipalityPublicly || donor.municipality !== filters.municipality) {
          return false;
        }
      }
      if (filters.availability) {
        const effectiveStatus = donor.notificationsPaused
          ? 'Temporarily Paused'
          : donor.availabilityPreference;
        if (effectiveStatus !== filters.availability) return false;
      }
      if (q) {
        const firstName = donor.fullName.split(' ')[0].toLowerCase();
        const searchable = `${firstName} ${donor.district} ${
          donor.shareMunicipalityPublicly ? donor.municipality : ''
        } ${donor.province} ${donor.bloodGroup}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });

    return [...matched].sort((a, b) => {
      if (filters.sortBy === 'district_asc') {
        return a.district.localeCompare(b.district);
      }
      if (filters.sortBy === 'province_asc') {
        return a.province.localeCompare(b.province);
      }
      if (filters.sortBy === 'blood_group') {
        return a.bloodGroup.localeCompare(b.bloodGroup);
      }
      const rankA = AVAILABILITY_RANK[a.notificationsPaused ? 'Temporarily Paused' : a.availabilityPreference] || 9;
      const rankB = AVAILABILITY_RANK[b.notificationsPaused ? 'Temporarily Paused' : b.availabilityPreference] || 9;
      return rankA - rankB;
    });
  }, [donors, filters]);

  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setCurrentPage,
  } = usePagination(filteredDonors, 8);

  return (
    <div className="mx-auto max-w-[90rem] space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-display text-foreground">Voluntary blood donor directory</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Discover registered voluntary donors across all seven provinces of Nepal. For donor
          safety and privacy, personal phone numbers, email addresses, and exact home coordinates
          are never published—all requests route through hospital blood bank verification.
        </p>
      </div>

      <NepalLocatorMap
        selectedProvince={filters.province}
        selectedDistrict={filters.district}
        onSelectProvince={(prov) => {
          handleFilterChange('province', prov);
          handleFilterChange('district', '');
          handleFilterChange('municipality', '');
          setCurrentPage(1);
        }}
        onSelectDistrict={(dist) => {
          handleFilterChange('district', dist);
          setCurrentPage(1);
        }}
        donors={donors}
        hospitals={hospitals}
      />

      <DonorFilterBar
        filters={filters}
        onChangeFilter={(key, val) => {
          handleFilterChange(key, val);
          setCurrentPage(1);
        }}
        onClearFilters={() => {
          handleClearFilters();
          setCurrentPage(1);
        }}
        resultCount={filteredDonors.length}
      />

      {paginatedItems.length === 0 ? (
        <Surface className="p-6">
          <EmptyState
            title="No voluntary donors match these filters"
            description="Try clearing the municipality or availability filter, or submit a hospital blood request so compatible donors in neighboring districts can be notified."
            actionLabel="Clear all filters"
            onAction={handleClearFilters}
          />
        </Surface>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {paginatedItems.map((donor) => (
              <DonorCard
                key={donor.id}
                donor={donor}
                onCoordinateRequest={(d) =>
                  navigate(
                    `/blood-requests?submit=1&bloodGroup=${encodeURIComponent(
                      d.bloodGroup
                    )}&province=${encodeURIComponent(d.province)}`
                  )
                }
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
