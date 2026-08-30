export const metadata = { title: "Privacy Policy — RUHVIQUE" };

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>
      <div className="prose prose-sm max-w-none space-y-5 text-muted-foreground">
        <section>
          <h2 className="text-lg font-bold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly — such as your name, email, phone number, shipping address, and payment information when you create an account or place an order. We also automatically collect usage data (IP address, browser type, pages visited) through cookies and similar technologies.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">2. How We Use Your Information</h2>
          <p>We use your information to process orders, communicate with you about your purchases, personalize your shopping experience, prevent fraud, and send marketing communications (you can opt out at any time). We never sell your personal information to third parties.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">3. Data Security</h2>
          <p>We implement industry-standard security measures including SSL encryption, secure password hashing, and PCI-DSS compliant payment processing. Your payment information is processed through authorized payment gateways and is never stored on our servers.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">4. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. You can also opt out of marketing communications and request a copy of your data. To exercise these rights, contact us at privacy@ruhvique.com.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">5. Cookies</h2>
          <p>We use cookies to remember your cart, keep you signed in, and analyze traffic. You can control cookies through your browser settings, though disabling them may affect site functionality.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">6. Contact</h2>
          <p>For any privacy-related questions, reach out to us at privacy@ruhvique.com or via our Contact page.</p>
        </section>
      </div>
    </div>
  );
}
