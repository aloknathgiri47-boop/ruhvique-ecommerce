export const metadata = { title: "Refund & Return Policy — RUHVIQUE" };

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Refund &amp; Return Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>
      <div className="prose prose-sm max-w-none space-y-5 text-muted-foreground">
        <section>
          <h2 className="text-lg font-bold text-foreground">1. Return Window</h2>
          <p>We offer a 7-day return window from the date of delivery. If you&apos;re not satisfied with your purchase, you may initiate a return within this period. Items must be unworn, unwashed, with all original tags and packaging intact.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">2. Non-Returnable Items</h2>
          <p>Certain items are non-returnable: innerwear, socks, accessories on sale, and items marked as &quot;Final Sale.&quot; Damaged or defective items are eligible for return regardless of category.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">3. How to Initiate a Return</h2>
          <p>Log in to your account, go to My Orders, select the order and item you wish to return, and submit a return request with the reason. Our team will review your request within 24–48 hours and send return instructions to your email.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">4. Refund Process</h2>
          <p>Once we receive and inspect your returned item, a refund will be processed to your original payment method within 5–7 business days. For COD orders, refunds are issued to your bank account or UPI ID provided during return initiation.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">5. Exchange</h2>
          <p>We offer free exchanges for size issues within the 7-day window. Initiate an exchange through My Orders — we&apos;ll arrange pickup of the original item and dispatch the new size once we receive the return.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">6. Damaged or Wrong Items</h2>
          <p>If you receive a damaged, defective, or incorrect item, contact us within 48 hours of delivery with photos. We&apos;ll arrange a free replacement or full refund — no return shipping cost to you.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">7. Shipping Costs</h2>
          <p>Return shipping for change-of-mind returns is borne by the customer. Return shipping for damaged, defective, or wrong items is borne by Ruhvique. Original shipping charges are non-refundable except in cases of our error.</p>
        </section>
      </div>
    </div>
  );
}
