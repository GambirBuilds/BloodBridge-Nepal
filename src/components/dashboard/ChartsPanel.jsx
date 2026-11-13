import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Surface } from '../common/ui';

export function BloodGroupDistributionChart({ data = [] }) {
  return (
    <Surface className="p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Donor & request distribution by blood group
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          Count of demonstration donors vs. active/historical blood requests across all 8 ABO/Rh types
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="group" tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={{ stroke: '#CBD5E1' }} />
            <YAxis tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#CBD5E1',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="donors" name="Registered Donors" fill="#DC2626" radius={[4, 4, 0, 0]} />
            <Bar dataKey="requests" name="Blood Requests" fill="#475569" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Surface>
  );
}

export function MonthlyRequestTrendsChart({ data = [] }) {
  return (
    <Surface className="p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Monthly blood request verification & fulfillment
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          Monthly count of submitted, hospital-verified, and fulfilled blood requests (Jun–Nov 2026 demo series)
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={{ stroke: '#CBD5E1' }} />
            <YAxis tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#CBD5E1',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="submitted"
              name="Submitted"
              stroke="#64748B"
              fill="#F1F5F9"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="verified"
              name="Hospital Verified"
              stroke="#DC2626"
              fill="#FEF2F2"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="fulfilled"
              name="Fulfilled"
              stroke="#16A34A"
              fill="#DCFCE7"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Surface>
  );
}

export function RegionalActivityChart({ data = [] }) {
  return (
    <Surface className="p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Provincial coordination activity across Nepal
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          Voluntary donor pool and blood request volume across all seven provinces (Demonstration totals)
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#4B5563' }} axisLine={{ stroke: '#CBD5E1' }} />
            <YAxis tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#CBD5E1',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="donors" name="Voluntary Donors" fill="#991B1B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="requests" name="Blood Requests" fill="#DC2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Surface>
  );
}
