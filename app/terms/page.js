'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <>
      <nav>
        <Link href="/" className="logo">PickPoolr</Link>
        <div className="nav-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/login" className="nav-cta">Sign in</Link>
        </div>
      </nav>

      <main className="legal-container">
        <h1>Terms of Service</h1>
        <p className="updated">Last updated: May 18, 2026</p>

        <section>
          <h2>1. Agreement to Terms</h2>
          <p>By accessing or using PickPoolr ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <ul>
            <li>You must be <strong>at least 18 years old</strong> to use PickPoolr.</li>
            <li>You must have the legal capacity to enter binding agreements.</li>
            <li>You must comply with all applicable laws in your jurisdiction regarding prediction pools and contests.</li>
          </ul>
        </section>

        <section>
          <h2>3. Account Registration</h2>
          <ul>
            <li>You must provide accurate, complete information when creating an account.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You are responsible for all activities that occur under your account.</li>
            <li>Notify us immediately of any unauthorized use at support@poolr.app.</li>
          </ul>
        </section>

        <section>
          <h2>4. Pool Participation</h2>
          
          <h3>4.1 Joining Pools</h3>
          <ul>
            <li>Payment is required before joining any paid pool.</li>
            <li>Once payment is confirmed, you become a pool member.</li>
            <li>Entry fees are processed via Stripe or external payment methods (Zelle, Venmo) as designated by the Pool Commissioner.</li>
          </ul>

          <h3>4.2 Submitting Picks</h3>
          <ul>
            <li>Match picks are <strong>locked immediately upon submission</strong> and cannot be edited.</li>
            <li>Special picks (Champion, Runner-up, Top Scorer, Best Goalkeeper) can be edited until the tournament deadline.</li>
            <li>You are responsible for submitting picks before posted deadlines.</li>
            <li>Missed deadlines result in zero points for those matches.</li>
          </ul>

          <h3>4.3 Scoring</h3>
          <ul>
            <li>Points are awarded based on the scoring rules displayed for each tournament.</li>
            <li>Final results and standings are determined by the Platform based on official match results.</li>
            <li>The Platform's determination of winners is final.</li>
          </ul>
        </section>

        <section>
          <h2>5. Pool Commissioners</h2>
          
          <h3>5.1 Commissioner Responsibilities</h3>
          <ul>
            <li>Commissioners are responsible for managing their pools.</li>
            <li>Commissioners set buy-in amounts, prize structures, and payment methods.</li>
            <li>Commissioners using external payments (Zelle/Venmo) are solely responsible for collecting and distributing funds.</li>
            <li>Commissioners must distribute prizes according to their stated prize structure.</li>
          </ul>

          <h3>5.2 Commissioner Rights</h3>
          <ul>
            <li>Commissioners may approve or deny membership requests for private pools.</li>
            <li>Commissioners may set pool rules within Platform guidelines.</li>
          </ul>
        </section>

        <section>
          <h2>6. Payments and Fees</h2>

          <h3>6.1 Platform Fee</h3>
          <ul>
            <li>PickPoolr charges a <strong>5% service fee</strong> on prize pools using Stripe payments.</li>
            <li>Commissioners choose whether the fee is added to player buy-ins or absorbed by the prize pool.</li>
            <li>External payment pools (Zelle/Venmo) do not incur Platform fees.</li>
          </ul>

          <h3>6.2 Stripe Payments</h3>
          <ul>
            <li>Payments are processed by Stripe, Inc.</li>
            <li>Stripe's terms of service apply to all transactions.</li>
            <li>Funds are held in escrow until tournament completion.</li>
            <li>Prize payouts are distributed via Stripe to winners' accounts.</li>
          </ul>

          <h3>6.3 Refunds</h3>
          <ul>
            <li>Entry fees are <strong>non-refundable</strong> once the tournament begins.</li>
            <li>Refund requests before tournament start are at Commissioner discretion.</li>
            <li>The Platform may issue refunds in cases of technical failure or pool cancellation.</li>
          </ul>
        </section>

        <section>
          <h2>7. Prohibited Conduct</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Create multiple accounts to gain unfair advantage</li>
            <li>Share picks with other participants before deadlines</li>
            <li>Manipulate or attempt to manipulate scores or standings</li>
            <li>Use automated systems or bots</li>
            <li>Violate any applicable laws</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Impersonate others or provide false information</li>
          </ul>
        </section>

        <section>
          <h2>8. Intellectual Property</h2>
          <ul>
            <li>The Platform, including all content, features, and functionality, is owned by PickPoolr and protected by copyright, trademark, and other intellectual property laws.</li>
            <li>You may not copy, modify, distribute, or create derivative works without permission.</li>
          </ul>
        </section>

        <section>
          <h2>9. Disclaimers</h2>
          <ul>
            <li>PickPoolr is a <strong>social prediction game platform</strong>, not a gambling service.</li>
            <li>The Platform does not guarantee any winnings or prizes.</li>
            <li>Participation is for entertainment purposes only.</li>
            <li>The Platform is provided "AS IS" without warranties of any kind.</li>
            <li>We do not guarantee uninterrupted or error-free operation.</li>
          </ul>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
          <ul>
            <li>PickPoolr is not liable for any indirect, incidental, special, consequential, or punitive damages.</li>
            <li>PickPoolr is not liable for lost profits, data, or opportunities.</li>
            <li>Our total liability shall not exceed the fees you paid to PickPoolr in the 12 months preceding the claim.</li>
            <li>PickPoolr is not responsible for Commissioner misconduct or failure to distribute prizes.</li>
          </ul>
        </section>

        <section>
          <h2>11. Indemnification</h2>
          <p>You agree to indemnify and hold harmless PickPoolr, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:</p>
          <ul>
            <li>Your use of the Platform</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Your role as Commissioner, if applicable</li>
          </ul>
        </section>

        <section>
          <h2>12. Account Termination</h2>
          <ul>
            <li>You may delete your account at any time via account settings.</li>
            <li>We may suspend or terminate accounts that violate these Terms.</li>
            <li>Termination does not relieve payment obligations for active pools.</li>
          </ul>
        </section>

        <section>
          <h2>13. Modifications</h2>
          <ul>
            <li>We may update these Terms at any time.</li>
            <li>Continued use of the Platform constitutes acceptance of updated Terms.</li>
            <li>Material changes will be communicated via email or Platform notification.</li>
          </ul>
        </section>

        <section>
          <h2>14. Governing Law</h2>
          <p>These Terms are governed by the laws of the <strong>State of Florida, United States</strong>, without regard to conflict of law principles.</p>
        </section>

        <section>
          <h2>15. Dispute Resolution</h2>
          <ul>
            <li>Disputes shall be resolved through binding arbitration under AAA rules.</li>
            <li>Class actions and jury trials are waived.</li>
            <li>Small claims court actions are permitted.</li>
          </ul>
        </section>

        <section>
          <h2>16. Contact</h2>
          <p>Questions about these Terms? Contact us:</p>
          <ul>
            <li>Email: legal@poolr.app</li>
          </ul>
        </section>
      </main>

      <footer>
        <div className="footer-logo">PickPoolr</div>
        <div className="footer-links">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <p className="footer-copy">© 2026 PickPoolr. Not affiliated with FIFA. For entertainment purposes only.</p>
      </footer>

      <style jsx>{`
        .legal-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        .legal-container h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 300;
          color: var(--silk);
          margin-bottom: 0.5rem;
        }

        .updated {
          color: var(--muted);
          font-size: 0.85rem;
          margin-bottom: 3rem;
        }

        section {
          margin-bottom: 2.5rem;
        }

        section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        section h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--silk);
          margin: 1.25rem 0 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        section p {
          color: var(--body);
          font-size: 0.95rem;
          line-height: 1.8;
          margin-bottom: 0.75rem;
        }

        section ul {
          list-style: none;
          padding: 0;
        }

        section li {
          color: var(--body);
          font-size: 0.95rem;
          line-height: 1.8;
          padding-left: 1.5rem;
          position: relative;
          margin-bottom: 0.5rem;
        }

        section li::before {
          content: '•';
          color: var(--gold);
          position: absolute;
          left: 0;
        }

        section strong {
          color: var(--silk);
        }
      `}</style>
    </>
  )
}
