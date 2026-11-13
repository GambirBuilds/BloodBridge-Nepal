import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/80 bg-surface text-foreground">
      <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight">
              <Droplet className="h-5 w-5 fill-primary text-primary" />
              <span>BLOODBRIDGE</span>
            </Link>
            <p className="mt-2 text-sm font-medium text-foreground">
              Connecting Lives, One Donation at a Time.
            </p>
            <p className="mt-2 max-w-md text-sm text-muted">
              Voluntary blood donor discovery and hospital blood request coordination platform
              designed for all seven provinces of Nepal. Zero brokerage, strict donor privacy, and
              hospital-verified requisitions.
            </p>
            <p className="mt-4 text-xs text-subtle">
              Coordination Desk: Putalisadak–Maharajgunj Health Tech Corridor, Kathmandu · +977 01-4200100 ·
              support@demo.bloodbridge.np
            </p>
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Network & Discovery</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-muted">
              <li>
                <Link to="/find-donors" className="hover:text-foreground">
                  Find Donors
                </Link>
              </li>
              <li>
                <Link to="/blood-requests" className="hover:text-foreground">
                  Blood Requests
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-foreground">
                  Hospitals and Blood Banks
                </Link>
              </li>
              <li>
                <Link to="/become-a-donor" className="hover:text-foreground">
                  Become a Donor
                </Link>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Platform & Portals</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-muted">
              <li>
                <Link to="/how-it-works" className="hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground">
                  Role Login (Demo)
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-foreground">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Support & Governance</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-muted">
              <li>
                <Link to="/faq" className="hover:text-foreground">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-border/60 pt-6 text-xs text-subtle sm:flex-row sm:items-center">
          <p>© 2026 BLOODBRIDGE Nepal · Part 1 Frontend Architecture Preview.</p>
          <p>
            Transparency notice: All people, hospitals, blood requests, statistics, and testimonials
            displayed in this frontend preview are demonstration records and do not represent live
            medical institutions.
          </p>
        </div>
      </div>
    </footer>
  );
}
