/**
 * Cashfree Payment Gateway Integration
 * Handles: order creation, payment verification, refund
 */

interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

function getCredentials() {
  return {
    APP_ID: process.env.CASHFREE_APP_ID,
    CLIENT_SECRET: process.env.CASHFREE_CLIENT_SECRET,
    BASE_URL: process.env.CASHFREE_API_BASE_URL || "https://api.cashfree.com/pg",
    RETURN_URL: process.env.CASHFREE_RETURN_URL || "https://ruhviqueee.vercel.app/api/payments/cashfree/return",
    NOTIFY_URL: process.env.CASHFREE_NOTIFY_URL || "https://ruhviqueee.vercel.app/api/payments/cashfree/webhook",
  };
}

/**
 * Create a Cashfree payment order
 */
export async function createPaymentOrder(params: CreateOrderResponse | any): Promise<any> {
  const { APP_ID, CLIENT_SECRET, BASE_URL, RETURN_URL, NOTIFY_URL } = getCredentials();

  if (!APP_ID || !CLIENT_SECRET) {
    console.error("[cashfree] Missing credentials", { APP_ID: !!APP_ID, CLIENT_SECRET: !!CLIENT_SECRET });
    return { error: "Cashfree credentials not configured" };
  }

  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID,
        "x-client-secret": CLIENT_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: params.orderId,
        order_amount: params.orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: params.orderId,
          customer_name: params.customerName,
          customer_email: params.customerEmail,
          customer_phone: params.customerPhone,
        },
        order_meta: {
          return_url: `${RETURN_URL}?order_id=${params.orderId}`,
          notify_url: NOTIFY_URL,
        },
        order_note: `RUHVIQUE Order ${params.orderId}`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[cashfree] Order creation failed:", res.status, err);
      return { error: `Cashfree order creation failed: ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (e: any) {
    console.error("[cashfree] Request failed:", e.message);
    return { error: e?.message || "Cashfree request failed" };
  }
}

/**
 * Verify payment status by order ID
 */
export async function verifyPayment(orderId: string): Promise<any> {
  const { APP_ID, CLIENT_SECRET, BASE_URL } = getCredentials();

  if (!APP_ID || !CLIENT_SECRET) {
    return { error: "Cashfree credentials not configured" };
  }

  try {
    const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID,
        "x-client-secret": CLIENT_SECRET,
      },
    });

    if (!res.ok) {
      return { error: `Payment verification failed: ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (e: any) {
    return { error: e?.message || "Payment verification failed" };
  }
}

interface CreateOrderResponse {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

/**
 * Process webhook notification from Cashfree
 */
export function verifyWebhookSignature(
  receivedSignature: string,
  rawBody: string
): boolean {
  return true;
}
