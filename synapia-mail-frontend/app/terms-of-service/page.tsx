'use client';

import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Terms of Service
          </h1>

          <div className="text-muted-foreground mb-4">
            <strong>Last updated:</strong> January 17, 2026
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using SynapIA Mail ("the Service"), you agree to be bound by these Terms of Service ("Terms").
              If you do not agree to these Terms, please do not use the Service.
            </p>
            <p className="text-muted-foreground">
              These Terms constitute a legally binding agreement between you and STROBBE Etienne regarding your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground mb-4">
              SynapIA Mail is an AI-powered email categorization and management service that helps users organize and manage their email communications.
              The Service includes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Automated email categorization using artificial intelligence</li>
              <li>Custom category creation and management</li>
              <li>Email processing and organization tools</li>
              <li>User account management and settings</li>
              <li>Integration with email providers (currently Outlook)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. User Accounts and Registration
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              3.1 Account Creation
            </h3>
            <p className="text-muted-foreground mb-4">
              To use the Service, you must create an account by providing accurate and complete information.
              You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              3.2 Account Security
            </h3>
            <p className="text-muted-foreground mb-4">
              You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use a strong, unique password</li>
              <li>Not share your account credentials with others</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mb-3">
              3.3 Account Termination
            </h3>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account for violations of these Terms or illegal activity.
              You may also request account deletion through our GDPR rights implementation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Acceptable Use Policy
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              4.1 Permitted Use
            </h3>
            <p className="text-muted-foreground mb-4">
              You may use the Service only for lawful purposes and in accordance with these Terms.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              4.2 Prohibited Activities
            </h3>
            <p className="text-muted-foreground mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated tools to access the Service without permission</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Send spam or unsolicited communications</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mb-3">
              4.3 Content Standards
            </h3>
            <p className="text-muted-foreground">
              You are responsible for ensuring that any content processed through our Service complies with applicable laws
              and does not contain illegal, harmful, or objectionable material.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Email Processing and Data Handling
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              5.1 Email Access
            </h3>
            <p className="text-muted-foreground mb-4">
              The Service requires access to your email account to provide categorization services.
              You grant us permission to read email metadata (subject, sender, timestamp) for processing purposes.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              5.2 Data Processing
            </h3>
            <p className="text-muted-foreground mb-4">
              We process your email data solely for the purpose of providing our categorization service.
              Email content is not stored permanently and is processed only for categorization purposes.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              5.3 Data Ownership
            </h3>
            <p className="text-muted-foreground">
              You retain ownership of all your email data. We do not claim ownership of your emails or content.
              Our processing is performed under your direction and for your benefit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Intellectual Property
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              6.1 Service IP
            </h3>
            <p className="text-muted-foreground mb-4">
              The Service, including all software, algorithms, user interfaces, and related materials,
              is owned by us and protected by intellectual property laws.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              6.2 User Content
            </h3>
            <p className="text-muted-foreground mb-4">
              You retain ownership of any content you create or upload, including custom categories and settings.
              By using the Service, you grant us a limited license to process this content for service provision.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              6.3 AI Training
            </h3>
            <p className="text-muted-foreground">
              We may use anonymized and aggregated data from user interactions to improve our AI models,
              but we do not use individual user email content for training purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Service Availability and Limitations
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              7.1 Service Level
            </h3>
            <p className="text-muted-foreground mb-4">
              We strive to provide reliable service but do not guarantee uninterrupted availability.
              The Service may be temporarily unavailable for maintenance, updates, or technical issues.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              7.2 AI Accuracy
            </h3>
            <p className="text-muted-foreground mb-4">
              Our AI-powered categorization is designed to be helpful but may not be 100% accurate.
              You are responsible for reviewing and correcting categorization results.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              7.3 Usage Limits
            </h3>
            <p className="text-muted-foreground">
              The Service may have usage limits based on your subscription plan.
              Excessive usage may result in temporary throttling or additional charges.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Fees and Payment
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              8.1 Subscription Plans
            </h3>
            <p className="text-muted-foreground mb-4">
              The Service may offer different subscription plans with varying features and usage limits.
              Current pricing and plans are available on our website.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              8.2 Payment Terms
            </h3>
            <p className="text-muted-foreground mb-4">
              If you subscribe to a paid plan:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Payments are processed securely through our payment providers</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Refunds are provided according to our refund policy</li>
              <li>Price changes will be communicated in advance</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mb-3">
              8.3 Credit System
            </h3>
            <p className="text-muted-foreground">
              Some features may use a credit-based system. Credits are consumed based on usage
              and may be purchased or earned through subscriptions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Third-Party Services
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              9.1 Email Providers
            </h3>
            <p className="text-muted-foreground mb-4">
              The Service integrates with third-party email providers (currently Microsoft Outlook).
              Your use of these integrations is subject to the provider's terms of service.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              9.2 AI Services
            </h3>
            <p className="text-muted-foreground mb-4">
              We use third-party AI services for email categorization. These services have their own
              terms and privacy policies that you should review.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              9.3 Disclaimers
            </h3>
            <p className="text-muted-foreground">
              We are not responsible for the actions or policies of third-party services.
              Your interactions with third parties are solely between you and the third party.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. Disclaimers and Limitation of Liability
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              10.1 Service Disclaimers
            </h3>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>The Service is provided "as is" without warranties of any kind.</strong> We disclaim all warranties,
                express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </div>

            <h3 className="text-xl font-medium text-foreground mb-3">
              10.2 AI Limitations
            </h3>
            <p className="text-muted-foreground mb-4">
              AI categorization results are provided for convenience and may not be accurate in all cases.
              You should not rely solely on AI categorization for critical email management decisions.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              10.3 Limitation of Liability
            </h3>
            <p className="text-muted-foreground mb-4">
              To the maximum extent permitted by law, our total liability for any claims related to the Service
              shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              10.4 Indirect Damages
            </h3>
            <p className="text-muted-foreground">
              We shall not be liable for any indirect, incidental, consequential, or punitive damages,
              including loss of profits, data, or business opportunities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              11. Indemnification
            </h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses
              arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              12. Termination
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              12.1 Termination by User
            </h3>
            <p className="text-muted-foreground mb-4">
              You may terminate your account at any time through the account settings or by contacting us.
              Upon termination, we will delete your account data according to our GDPR compliance procedures.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              12.2 Termination by Us
            </h3>
            <p className="text-muted-foreground mb-4">
              We may terminate or suspend your account immediately for violations of these Terms or illegal activity.
              You will be notified of the termination and the reasons for it.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              12.3 Effect of Termination
            </h3>
            <p className="text-muted-foreground">
              Upon termination, your right to use the Service ceases immediately. We may retain certain data
              as required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              13. Governing Law and Dispute Resolution
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              13.1 Governing Law
            </h3>
            <p className="text-muted-foreground mb-4">
              These Terms are governed by the laws of France, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              13.2 Dispute Resolution
            </h3>
            <p className="text-muted-foreground mb-4">
              Any disputes arising from these Terms shall be resolved through amicable negotiations.
              If resolution cannot be reached, disputes shall be subject to the jurisdiction of the courts of France.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3">
              13.3 EU Consumer Rights
            </h3>
            <p className="text-muted-foreground">
              If you are an EU consumer, you may also have additional rights under applicable consumer protection laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              14. Changes to Terms
            </h2>
            <p className="text-muted-foreground mb-4">
              We may update these Terms from time to time. We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Email notification to your registered email address</li>
              <li>Prominent notice on the Service</li>
              <li>Updating the "Last updated" date above</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Your continued use of the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              15. Contact Information
            </h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">
                <strong>Email:</strong> legal@synapia-mail.com
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Address:</strong> [Company Address], France
              </p>
              <p className="text-muted-foreground">
                <strong>Response Time:</strong> We aim to respond to all inquiries within 5 business days.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              16. Severability
            </h2>
            <p className="text-muted-foreground">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              17. Entire Agreement
            </h2>
            <p className="text-muted-foreground">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and us
              regarding the use of the Service and supersede all prior agreements.
            </p>
          </section>

          <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              📋 Legal Compliance Summary
            </h3>
            <p className="text-muted-foreground mb-3">
              These Terms of Service ensure fair and transparent use of SynapIA Mail while protecting both users and the service provider.
              They comply with applicable French and EU consumer protection laws.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">User Rights</span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Service Limitations</span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Legal Compliance</span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Fair Usage</span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Liability Protection</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              By using SynapIA Mail, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              If you do not agree to these terms, please discontinue use of the service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
