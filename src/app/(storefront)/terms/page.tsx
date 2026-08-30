export const metadata = { title: "Terms & Conditions — RUHVIQUE" };

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Terms &amp; Conditions</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>
      <div className="prose prose-sm max-w-none space-y-5 text-muted-foreground">
        <section>
          <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing or using ruhvique.com, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our website or services.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">2. Products &amp; Pricing</h2>
          <p>All products are subject to availability. We reserve the right to modify or discontinue any product without notice. Prices are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right to correct any pricing errors.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">3. Orders</h2>
          <p>All orders are subject to acceptance and availability. We may refuse or cancel any order at our discretion. Order confirmation does not constitute order acceptance until the items are dispatched. Title and risk of loss pass to you upon delivery.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">4. Account Responsibility</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must be 18 years or older to make purchases. We may suspend or terminate accounts that violate these terms.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">5. Intellectual Property</h2>
          <p>All content on this website — including logos, designs, text, and graphics — is the property of Ruhvique and protected by intellectual property laws. You may not reproduce, distribute, or use any content without our written permission.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">6. Liability</h2>
          <p>Ruhvique is not liable for indirect, incidental, or consequential damages arising from the use of our products or website. Our maximum liability is limited to the amount you paid for the product in question.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">7. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.</p>
        </section>
      </div>
    </div>
  );
}
