'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <>
      <nav>
        <Link href="/" className="logo">PickPoolr</Link>
        <div className="nav-links">
          <Link href="/terms">Terms</Link>
          <Link href="/login" className="nav-cta">Sign in</Link>
        </div>
      </nav>

      <main className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="updated">Last updated: May 18, 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>PickPoolr ("we," "our," "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our platform.</p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>

          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, password</li>
            <li><strong>Profile Information:</strong> Display name, avatar (optional)</li>
            <li><strong>Payment Information:</strong> Processed by Stripe; we do not store full card numbers</li>
            <li><strong>Pool Activity:</strong> Picks, predictions, pool memberships</li>
            <li><strong>Communications:</strong> Messages, support requests</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, timestamps</li>
            <li><strong>IP Address:</strong> For security and approximate location</li>
            <li><strong>Cookies:</strong> Session management, preferences (see Section 7)</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain the Platform</li>
            <li>Process payments and distribute prizes</li>
            <li>Calculate scores and update leaderboards</li>
            <li>Send important notifications (deadlines, results, payouts)</li>
            <li>Improve our services and user experience</li>
            <li>Prevent fraud and enforce our Terms</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. How We Share Your Information</h2>

          <h3>4.1 With Other Users</h3>
          <ul>
            <li><strong>Pool Members:</strong> Your display name, picks (after deadlines), and standings are visible to other pool members.</li>
            <li><strong>Public Pools:</strong> Leaderboard may be publicly accessible.</li>
          </ul>

          <h3>4.2 With Service Providers</h3>
          <ul>
            <li><strong>Stripe:</strong> Payment processing and payouts</li>
            <li><strong>Supabase:</strong> Database hosting and authentication</li>
            <li><strong>Vercel:</strong> Website hosting</li>
            <li><strong>Analytics Providers:</strong> Aggregated, anonymized usage data</li>
          </ul>

          <h3>4.3 Legal Requirements</h3>
          <p>We may disclose information if required by law, court order, or government request.</p>

          <h3>4.4 Business Transfers</h3>
          <p>In case of merger, acquisition, or sale, user information may be transferred to the new entity.</p>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <ul>
            <li><strong>Account Data:</strong> Retained while your account is active</li>
            <li><strong>Pool Data:</strong> Retained for 3 years after pool completion for records</li>
            <li><strong>Payment Records:</strong> Retained as required by law (typically 7 years)</li>
            <li><strong>Deleted Accounts:</strong> Data removed within 30 days, except where legally required</li>
          </ul>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Objection:</strong> Opt out of certain data processing</li>
          </ul>
          <p><strong>To exercise these rights:</strong> Email privacy@poolr.app with your request.</p>

          <h3>California Residents (CCPA)</h3>
          <ul>
            <li>Right to know what data is collected</li>
            <li>Right to delete personal information</li>
            <li>Right to opt out of data sales (we do not sell data)</li>
            <li>Right to non-discrimination</li>
          </ul>

          <h3>European Residents (GDPR)</h3>
          <ul>
            <li>All rights listed above apply</li>
            <li>Legal basis for processing: Contract performance, legitimate interests, consent</li>
            <li>Data transfers outside EU are protected by Standard Contractual Clauses</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>We use cookies for:</p>
          <ul>
            <li><strong>Essential:</strong> Login sessions, security</li>
            <li><strong>Functional:</strong> Language preferences, settings</li>
            <li><strong>Analytics:</strong> Understanding how users interact with the Platform</li>
          </ul>
          <p>You can manage cookies through your browser settings. Disabling cookies may limit functionality.</p>
        </section>

        <section>
          <h2>8. Security</h2>
          <p>We implement industry-standard security measures including:</p>
          <ul>
            <li>Encryption in transit (HTTPS/TLS)</li>
            <li>Encryption at rest for sensitive data</li>
            <li>Secure password hashing</li>
            <li>Regular security audits</li>
            <li>Limited employee access to data</li>
          </ul>
          <p>No system is 100% secure. Report security concerns to security@poolr.app.</p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>PickPoolr is not intended for users under 18. We do not knowingly collect data from minors. If we learn a minor has provided data, we will delete it promptly.</p>
        </section>

        <section>
          <h2>10. International Users</h2>
          <p>The Platform is operated from the United States. By using PickPoolr, you consent to the transfer of your information to the US, which may have different data protection laws than your country.</p>
        </section>

        <section>
          <h2>11. Third-Party Links</h2>
          <p>The Platform may contain links to third-party websites. We are not responsible for their privacy practices.</p>
        </section>

        <section>
          <h2>12. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify you of material changes via email or Platform notification.</p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>Questions or concerns about privacy? Contact us:</p>
          <ul>
            <li>Email: privacy@poolr.app</li>
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
          font-weight: 600;
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
          font-weight: 600;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        section h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
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
