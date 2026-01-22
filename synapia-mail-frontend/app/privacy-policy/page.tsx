'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            ← {t('back')} {t('dashboard')}
          </Link>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            {t('privacyPolicy')}
          </h1>

          <div className="text-muted-foreground mb-4">
            <strong>{t('lastUpdated')}:</strong> January 17, 2026
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. {t('introduction')}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t('introduction')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. {t('dataController')}
            </h2>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">
                <strong>{t('dataController')}:</strong> STROBBE Etienne
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Contact Email:</strong> privacy@synapia-mail.com
              </p>
              <p className="text-muted-foreground">
                <strong>Address:</strong> [Company Address], France
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. Information We Collect
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              3.1 Personal Data You Provide
            </h3>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password</li>
              <li><strong>Email Categories:</strong> Custom categories you create for email organization</li>
              <li><strong>Consent Preferences:</strong> Your choices regarding marketing communications and data processing</li>
              <li><strong>Communication Data:</strong> Messages you send us regarding support or complaints</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mb-3">
              3.2 Data from Email Processing
            </h3>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li><strong>Email Metadata:</strong> Subject lines, sender information, timestamps</li>
              <li><strong>Usage Data:</strong> How you interact with our service, categorization preferences</li>
              <li><strong>Technical Data:</strong> IP addresses, browser information, device data</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mb-3">
              3.3 OAuth Data (Outlook Integration)
            </h3>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li><strong>Access Tokens:</strong> Encrypted tokens for email access (never stored in plain text)</li>
              <li><strong>Email Permissions:</strong> Granted permissions for reading and categorizing emails</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. How We Use Your Information
            </h2>
            <p className="text-muted-foreground mb-4">
              We process your personal data for the following purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Service Provision:</strong> To provide email categorization and management services</li>
              <li><strong>Account Management:</strong> To create and manage your user account</li>
              <li><strong>Communication:</strong> To respond to your inquiries and provide customer support</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
              <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our services</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Legal Basis for Processing
            </h2>
            <p className="text-muted-foreground mb-4">
              Under GDPR, we rely on the following legal bases for processing your personal data:
            </p>
            <div className="space-y-3">
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Performance of Contract (Art. 6(1)(b))</h4>
                <p className="text-sm text-muted-foreground">Processing necessary for providing our email categorization service to you.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Consent (Art. 6(1)(a))</h4>
                <p className="text-sm text-muted-foreground">Processing based on your explicit consent for marketing communications and analytics.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Legitimate Interest (Art. 6(1)(f))</h4>
                <p className="text-sm text-muted-foreground">Processing necessary for our legitimate interests in improving services and ensuring security.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Legal Obligation (Art. 6(1)(c))</h4>
                <p className="text-sm text-muted-foreground">Processing required to comply with legal obligations, including data protection laws.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Data Sharing and Recipients
            </h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal data to third parties. We may share your data in the following limited circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our service (hosting, email processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Data Retention
            </h2>
            <p className="text-muted-foreground mb-4">
              We retain your personal data for the following periods:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">Data Type</th>
                    <th className="border border-border p-3 text-left">Retention Period</th>
                    <th className="border border-border p-3 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Account Data</td>
                    <td className="border border-border p-3">Until account deletion</td>
                    <td className="border border-border p-3">Service provision</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Email Metadata</td>
                    <td className="border border-border p-3">1 year after processing</td>
                    <td className="border border-border p-3">Service improvement</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Audit Logs</td>
                    <td className="border border-border p-3">3 years</td>
                    <td className="border border-border p-3">Legal compliance</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Complaints</td>
                    <td className="border border-border p-3">5 years</td>
                    <td className="border border-border p-3">Legal documentation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Your GDPR Rights
            </h2>
            <p className="text-muted-foreground mb-4">
              Under GDPR, you have the following rights regarding your personal data:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Right of Access (Art. 15)</h4>
                <p className="text-sm text-muted-foreground">Request a copy of all personal data we hold about you.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Right to Rectification (Art. 16)</h4>
                <p className="text-sm text-muted-foreground">Request correction of inaccurate or incomplete data.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Right to Erasure (Art. 17)</h4>
                <p className="text-sm text-muted-foreground">Request deletion of your personal data ("right to be forgotten").</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Right to Data Portability (Art. 20)</h4>
                <p className="text-sm text-muted-foreground">Receive your data in a machine-readable format.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Right to Object (Art. 21)</h4>
                <p className="text-sm text-muted-foreground">Object to processing based on legitimate interests.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Right to Withdraw Consent</h4>
                <p className="text-sm text-muted-foreground">Withdraw consent for processing activities.</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-foreground mb-2">How to Exercise Your Rights</h4>
              <p className="text-sm text-muted-foreground mb-2">
                You can exercise your GDPR rights through our dashboard or by contacting us at privacy@synapia-mail.com.
                We will respond to your request within 30 days.
              </p>
              <Link
                href="/dashboard"
                className="text-primary hover:text-primary/80 text-sm underline"
              >
                Go to Dashboard →
              </Link>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Cookies and Tracking
            </h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Authentication Cookies:</strong> To keep you logged in securely</li>
              <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Only with your consent, to improve our service</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can control cookie preferences through your browser settings or our consent management tools.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-muted-foreground mb-4">
              Your data is primarily processed within the European Economic Area (EEA). If data transfers outside the EEA occur,
              we ensure appropriate safeguards are in place, such as:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Standard Contractual Clauses approved by the European Commission</li>
              <li>Adequacy decisions for countries with equivalent protection</li>
              <li>Your explicit consent for specific transfers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              11. Data Security
            </h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to protect your personal data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Encryption:</strong> Data encrypted at rest and in transit</li>
              <li><strong>Access Controls:</strong> Strict access controls and authentication</li>
              <li><strong>Regular Audits:</strong> Security audits and vulnerability assessments</li>
              <li><strong>Incident Response:</strong> Procedures for handling security incidents</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              12. Data Breach Notification
            </h2>
            <p className="text-muted-foreground mb-4">
              In the event of a personal data breach, we will notify affected users and the relevant supervisory authority
              within 72 hours, as required by GDPR Article 33-34, unless the breach poses no risk to individuals' rights and freedoms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              13. Complaints
            </h2>
            <p className="text-muted-foreground mb-4">
              If you believe we have not complied with GDPR or your data protection rights, you have the right to lodge a complaint with:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">
                <strong>CNIL (Commission Nationale de l'Informatique et des Libertés)</strong>
              </p>
              <p className="text-muted-foreground mb-2">
                Website: <a href="https://www.cnil.fr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
              </p>
              <p className="text-muted-foreground">
                You can also contact us first at privacy@synapia-mail.com to try to resolve the issue.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              14. Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
              Your continued use of our service after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              15. Contact Us
            </h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">
                <strong>Email:</strong> privacy@synapia-mail.com
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Data Protection Officer:</strong> privacy@synapia-mail.com
              </p>
              <p className="text-muted-foreground">
                <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 30 days.
              </p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              📋 GDPR Compliance Summary
            </h3>
            <p className="text-muted-foreground mb-3">
              SynapIA Mail is committed to GDPR compliance. We have implemented all necessary technical and organizational measures
              to protect your personal data and respect your privacy rights.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Data Subject Rights</span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Lawful Processing</span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Data Minimization</span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Security Measures</span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Audit Logging</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
