import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  BloodGroupMark,
  Button,
  EmptyState,
  Field,
  SelectField,
  StatusText,
  Surface,
  Switch,
} from '../../components/common/ui';
import StatStrip from '../../components/dashboard/StatStrip';
import RequestCard from '../../components/requests/RequestCard';
import {
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
  getProvinceNames,
} from '../../data/locations';
import { useAuth } from '../../hooks/useAuth';
import { usePlatformData } from '../../hooks/usePlatformData';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { BLOOD_COMPATIBILITY } from '../../utils/bloodCompatibility';
import { formatDisplayDate, formatPublicDonorName } from '../../utils/formatters';

export default function DonorDashboard() {
  const { currentUser } = useAuth();
  const {
    donors,
    requests,
    notifications,
    updateDonorProfile,
    toggleDonorAvailability,
    pledgeDonorToRequest,
    markNotificationRead,
    markAllNotificationsRead,
  } = usePlatformData();
  const { showToast } = useToast();

  const donor =
    donors.find((d) => d.id === currentUser?.linkedRecordId) ||
    donors.find((d) => d.email === currentUser?.email) ||
    donors[0];

  const [profileDraft, setProfileDraft] = useState({
    fullName: donor.fullName,
    phone: donor.phone,
    province: donor.province,
    district: donor.district,
    municipality: donor.municipality,
    approximateLocation: donor.approximateLocation || '',
    preferredContactMethod: donor.preferredContactMethod,
  });

  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const compatibility = BLOOD_COMPATIBILITY[donor.bloodGroup] || BLOOD_COMPATIBILITY['O+'];

  const incomingCompatibleRequests = requests.filter((req) => {
    if (!['Verified', 'Donor Coordination', 'Pending', 'Under Verification'].includes(req.status)) {
      return false;
    }
    return compatibility.canDonateTo.includes(req.bloodGroup);
  });

  const donorNotifications = notifications.filter((n) => n.targetRole === 'donor');

  const handlePauseToggle = async (paused) => {
    await toggleDonorAvailability(donor.id, {
      notificationsPaused: paused,
      availabilityPreference: paused ? 'Temporarily Paused' : 'Available Now',
    });
    showToast({
      tone: 'success',
      title: paused ? 'Request notifications paused' : 'Request notifications resumed',
      description: paused
        ? 'You will not receive new blood request alerts until you resume (Demo Mode).'
        : 'Compatible verified requests in your area are active again.',
    });
  };

  const handleAvailabilityChange = async (nextPref) => {
    await toggleDonorAvailability(donor.id, {
      availabilityPreference: nextPref,
      notificationsPaused: nextPref === 'Temporarily Paused',
    });
    showToast({
      tone: 'success',
      title: `Availability set to ${nextPref}`,
      description: 'Updated across public directory cards (Demo Mode).',
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateDonorProfile(donor.id, profileDraft);
    showToast({
      tone: 'success',
      title: 'Donor profile updated',
      description: 'Location and contact method saved in local preview storage.',
    });
  };

  const handlePledge = async (req) => {
    await pledgeDonorToRequest(req.id, donor.id, donor.fullName);
    showToast({
      tone: 'success',
      title: `Readiness confirmed for ${req.id}`,
      description: `${req.hospitalName} transfusion desk notified (Demo Mode).`,
    });
  };

  const provinces = getProvinceNames();
  const districts = getDistrictsByProvince(profileDraft.province);
  const municipalities = getMunicipalitiesByDistrict(
    profileDraft.province,
    profileDraft.district
  );

  return (
    <DashboardLayout
      role="donor"
      title={`Namaste, ${donor.fullName.split(' ')[0]}`}
      subtitle={`Voluntary ${donor.bloodGroup} donor · ${donor.district}, ${donor.province.replace(' Province', '')}`}
      primaryAction={
        <Button
          tone={donor.notificationsPaused ? 'primary' : 'quiet'}
          size="sm"
          onClick={() => handlePauseToggle(!donor.notificationsPaused)}
        >
          {donor.notificationsPaused ? 'Resume request alerts' : 'Pause notifications'}
        </Button>
      }
    >
      {({ activeTab, setActiveTab }) => (
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              <StatStrip
                leadMetric={{
                  label: 'Current voluntary availability',
                  value: donor.notificationsPaused
                    ? 'Paused'
                    : donor.availabilityPreference,
                  caption: `Public card name: ${formatPublicDonorName(
                    donor.fullName,
                    donor.publicDisplayMode
                  )} · Member since ${formatDisplayDate(donor.registeredAt)}`,
                }}
                secondaryMetrics={[
                  {
                    label: 'Blood group',
                    value: donor.bloodGroup,
                    highlight: true,
                    caption: compatibility.label,
                  },
                  {
                    label: 'Compatible requests',
                    value: incomingCompatibleRequests.length,
                    caption: 'Active across network',
                  },
                  {
                    label: 'Recorded donations',
                    value: donor.totalDonationsRecorded || 0,
                    caption: 'Voluntary history',
                  },
                  {
                    label: 'Unread alerts',
                    value: donorNotifications.filter((n) => !n.read).length,
                    caption: donor.preferredContactMethod,
                  },
                ]}
              />

              {/* Blood Group & Availability Control Card */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <Surface className="divide-y divide-border/60 p-6 lg:col-span-5">
                  <div className="flex items-start justify-between gap-3 pb-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Blood group & clinical compatibility
                      </h2>
                      <p className="mt-0.5 text-xs text-muted">
                        Licensed hospital staff perform final screening in person
                      </p>
                    </div>
                    <BloodGroupMark group={donor.bloodGroup} size="lg" />
                  </div>

                  <div className="py-4 text-sm">
                    <p className="text-xs font-medium text-muted">
                      Patients who can receive your packed red cells
                    </p>
                    <p className="mt-1 font-semibold tabular-nums text-foreground">
                      {compatibility.canDonateTo.join('  ·  ')}
                    </p>
                    <p className="mt-2 text-xs text-muted">{compatibility.clinicalNote}</p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <SelectField
                      label="Update availability preference"
                      value={
                        donor.notificationsPaused
                          ? 'Temporarily Paused'
                          : donor.availabilityPreference
                      }
                      onChange={(e) => handleAvailabilityChange(e.target.value)}
                      options={[
                        'Available Now',
                        'Weekends & Evenings',
                        'Emergency Only',
                        'Temporarily Paused',
                      ]}
                    />

                    <Switch
                      checked={Boolean(donor.notificationsPaused)}
                      onChange={handlePauseToggle}
                      label="Pause incoming blood request notifications"
                      description="Silences alerts while recovering from donation or traveling"
                    />
                  </div>
                </Surface>

                <Surface className="divide-y divide-border/60 p-6 lg:col-span-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Profile & privacy summary
                      </h2>
                      <p className="mt-0.5 text-xs text-muted">
                        Personal phone and email stay hidden on public search pages
                      </p>
                    </div>
                    <Button tone="quiet" size="sm" onClick={() => setActiveTab('profile')}>
                      Edit profile
                    </Button>
                  </div>

                  <dl className="grid grid-cols-1 gap-4 py-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted">Full name (Account)</dt>
                      <dd className="mt-0.5 font-medium text-foreground">{donor.fullName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Public directory display</dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {formatPublicDonorName(donor.fullName, donor.publicDisplayMode)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Protected phone (Private)</dt>
                      <dd className="mt-0.5 font-medium text-foreground">{donor.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Municipality visibility</dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {donor.shareMunicipalityPublicly
                          ? `Shown (${donor.municipality})`
                          : 'Hidden (District only)'}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                    <StatusText
                      status={
                        donor.notificationsPaused
                          ? 'Temporarily Paused'
                          : donor.availabilityPreference
                      }
                    />
                    <Button tone="quiet" size="sm" onClick={() => setActiveTab('privacy')}>
                      Manage privacy controls
                    </Button>
                  </div>
                </Surface>
              </div>

              {/* Incoming Compatible Requests Preview */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Compatible blood requests needing donors
                    </h2>
                    <p className="text-xs text-muted">
                      Requests compatible with {donor.bloodGroup} donors across Nepal (Demo records)
                    </p>
                  </div>
                  <Button tone="quiet" size="sm" onClick={() => setActiveTab('requests')}>
                    View all ({incomingCompatibleRequests.length})
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {incomingCompatibleRequests.slice(0, 2).map((req) => {
                    const alreadyPledged = (req.pledgedDonors || []).includes(donor.id);
                    return (
                      <RequestCard
                        key={req.id}
                        request={req}
                        primaryActionLabel={
                          alreadyPledged
                            ? 'Readiness confirmed'
                            : 'Confirm readiness to donate'
                        }
                        primaryActionDisabled={alreadyPledged || donor.notificationsPaused}
                        onPrimaryAction={handlePledge}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Incoming compatible blood requests
                </h2>
                <p className="text-sm text-muted">
                  Respond to hospital-verified blood requests matching your {donor.bloodGroup} donor
                  compatibility.
                </p>
              </div>

              {incomingCompatibleRequests.length === 0 ? (
                <Surface className="p-6">
                  <EmptyState
                    title="No compatible blood requests right now"
                    description="You will be notified according to your contact preference when a hospital verifies a compatible request."
                  />
                </Surface>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {incomingCompatibleRequests.map((req) => {
                    const alreadyPledged = (req.pledgedDonors || []).includes(donor.id);
                    return (
                      <RequestCard
                        key={req.id}
                        request={req}
                        primaryActionLabel={
                          alreadyPledged
                            ? 'Readiness confirmed'
                            : 'Confirm readiness to visit hospital'
                        }
                        primaryActionDisabled={alreadyPledged || donor.notificationsPaused}
                        onPrimaryAction={handlePledge}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <Surface className="divide-y divide-border/60 p-6">
              <div className="pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Voluntary donation history
                </h2>
                <p className="mt-0.5 text-sm text-muted">
                  Historical donations recorded for {donor.fullName} (Demonstration records)
                </p>
              </div>

              {(donor.donationHistory || []).length === 0 ? (
                <EmptyState
                  title="No completed hospital donations logged yet"
                  description="Once a hospital transfusion desk confirms a completed voluntary donation, your acknowledgement certificate reference appears here."
                  actionLabel="View active blood requests"
                  onAction={() => setActiveTab('requests')}
                />
              ) : (
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/70 text-xs font-semibold tracking-wider text-muted uppercase">
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3 pr-4">Hospital / Blood Bank</th>
                        <th className="py-3 pr-4">Request ID</th>
                        <th className="py-3 pr-4 text-right">Units</th>
                        <th className="py-3 text-right">Certificate Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {donor.donationHistory.map((entry) => (
                        <tr key={entry.id}>
                          <td className="py-3.5 pr-4 whitespace-nowrap tabular-nums text-foreground">
                            {formatDisplayDate(entry.date)}
                          </td>
                          <td className="py-3.5 pr-4 font-medium text-foreground">
                            {entry.hospital}
                          </td>
                          <td className="py-3.5 pr-4 font-mono text-xs text-muted">
                            {entry.requestCode}
                          </td>
                          <td className="py-3.5 pr-4 text-right tabular-nums text-foreground">
                            {entry.units}
                          </td>
                          <td className="py-3.5 text-right font-mono text-xs text-success">
                            {entry.certificateRef}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Surface>
          )}

          {activeTab === 'notifications' && (
            <Surface className="divide-y divide-border/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Donor notifications</h2>
                  <p className="text-sm text-muted">
                    Verified blood match alerts and certificate updates
                  </p>
                </div>
                <Button
                  tone="quiet"
                  size="sm"
                  onClick={() => markAllNotificationsRead('donor')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark all as read
                </Button>
              </div>

              <div className="divide-y divide-border/50">
                {donorNotifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-4 py-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                        )}
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted">{item.message}</p>
                      <p className="mt-1 text-xs text-subtle">
                        {item.category} · {item.createdAt}
                      </p>
                    </div>
                    {!item.read && (
                      <Button
                        tone="quiet"
                        size="sm"
                        onClick={() => markNotificationRead(item.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Surface>
          )}

          {activeTab === 'profile' && (
            <Surface className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground">Edit donor profile</h2>
              <p className="mt-1 text-sm text-muted">
                Keep your administrative district and contact method current for accurate matching.
              </p>

              <form
                onSubmit={handleSaveProfile}
                className="mt-6 space-y-5 border-t border-border/60 pt-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    value={profileDraft.fullName}
                    onChange={(e) =>
                      setProfileDraft((p) => ({ ...p, fullName: e.target.value }))
                    }
                  />
                  <Field
                    label="Phone number (+977)"
                    value={profileDraft.phone}
                    onChange={(e) =>
                      setProfileDraft((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                  <SelectField
                    label="Province"
                    value={profileDraft.province}
                    options={provinces}
                    onChange={(e) => {
                      const prov = e.target.value;
                      const dList = getDistrictsByProvince(prov);
                      const firstD = dList[0] || '';
                      const mList = getMunicipalitiesByDistrict(prov, firstD);
                      setProfileDraft((p) => ({
                        ...p,
                        province: prov,
                        district: firstD,
                        municipality: mList[0] || '',
                      }));
                    }}
                  />
                  <SelectField
                    label="District"
                    value={profileDraft.district}
                    options={districts}
                    onChange={(e) => {
                      const dist = e.target.value;
                      const mList = getMunicipalitiesByDistrict(profileDraft.province, dist);
                      setProfileDraft((p) => ({
                        ...p,
                        district: dist,
                        municipality: mList[0] || '',
                      }));
                    }}
                  />
                  <SelectField
                    label="Municipality"
                    value={profileDraft.municipality}
                    options={municipalities}
                    onChange={(e) =>
                      setProfileDraft((p) => ({ ...p, municipality: e.target.value }))
                    }
                  />
                  <SelectField
                    label="Preferred contact method"
                    value={profileDraft.preferredContactMethod}
                    options={['Platform Notification', 'Hospital Desk Call', 'SMS Alert']}
                    onChange={(e) =>
                      setProfileDraft((p) => ({
                        ...p,
                        preferredContactMethod: e.target.value,
                      }))
                    }
                  />
                </div>

                <Field
                  label="Approximate neighborhood / chowk (Optional)"
                  value={profileDraft.approximateLocation}
                  onChange={(e) =>
                    setProfileDraft((p) => ({
                      ...p,
                      approximateLocation: e.target.value,
                    }))
                  }
                />

                <div className="flex justify-end border-t border-border/50 pt-4">
                  <Button type="submit">Save profile changes</Button>
                </div>
              </form>
            </Surface>
          )}

          {activeTab === 'privacy' && (
            <Surface className="divide-y divide-border/60 p-6 sm:p-8">
              <div className="pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Donor directory privacy settings
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Control how your voluntary profile appears on public search cards. Your phone
                  number and email address are never shown publicly regardless of these settings.
                </p>
              </div>

              <div className="space-y-5 py-5">
                <SelectField
                  label="Public display name style"
                  value={donor.publicDisplayMode || 'first_initial'}
                  onChange={(e) => {
                    updateDonorProfile(donor.id, { publicDisplayMode: e.target.value });
                    showToast({
                      tone: 'success',
                      title: 'Public display name updated',
                    });
                  }}
                  options={[
                    { value: 'first_initial', label: 'First name + surname initial (e.g. Suman T.)' },
                    { value: 'first_only', label: 'First name only (e.g. Suman)' },
                    { value: 'full_consented', label: 'Full name (Consented)' },
                  ]}
                />

                <Switch
                  checked={Boolean(donor.shareMunicipalityPublicly)}
                  onChange={(val) => {
                    updateDonorProfile(donor.id, { shareMunicipalityPublicly: val });
                    showToast({
                      tone: 'success',
                      title: val
                        ? 'Municipality visible on donor card'
                        : 'Municipality hidden from public card',
                    });
                  }}
                  label="Show my municipality on public donor cards"
                  description="When off, only your district and province are shown publicly."
                />

                <Switch
                  checked={Boolean(donor.notificationsPaused)}
                  onChange={handlePauseToggle}
                  label="Pause all incoming blood request notifications"
                  description="Temporarily marks your status as Paused so families know not to disturb."
                />
              </div>
            </Surface>
          )}

          {activeTab === 'settings' && (
            <Surface className="divide-y divide-border/60 p-6 sm:p-8">
              <div className="pb-4">
                <h2 className="text-lg font-semibold text-foreground">Account settings</h2>
                <p className="mt-1 text-sm text-muted">
                  Credential management (Part 2 backend auth hook) and demo session information.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPasswordDraft({ currentPassword: '', newPassword: '' });
                  showToast({
                    tone: 'success',
                    title: 'Password update simulated (Demo Mode)',
                    description: 'Real password hashing & JWT rotation connect in Part 2.',
                  });
                }}
                className="space-y-4 py-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Current password"
                    type="password"
                    required
                    value={passwordDraft.currentPassword}
                    onChange={(e) =>
                      setPasswordDraft((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                  />
                  <Field
                    label="New password"
                    type="password"
                    required
                    minLength={8}
                    value={passwordDraft.newPassword}
                    onChange={(e) =>
                      setPasswordDraft((p) => ({ ...p, newPassword: e.target.value }))
                    }
                  />
                </div>
                <Button type="submit" tone="quiet">
                  Update password (Demo)
                </Button>
              </form>
            </Surface>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
