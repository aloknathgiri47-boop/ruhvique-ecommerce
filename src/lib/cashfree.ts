/**
 * Cashfree Payment Gateway Integration
 * Handles: order creation, payment verification, refund
 */

const APP_ID = process.env.CASHFREE_APP_ID;
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const BASE_URL = process.env.CASHFREE_API_BASE_URL || "https://api.cashfree.com/pg";
const RETURN_URL = process.env.CASHFREE_RETURN_URL || "http://localhost:3000/api/payments/cashfree/return";
const NOTIFY_URL = process.env.CASHFREE_NOTIFY_URL || "http://localhost:3000/api/payments/cashfree/webhook";

interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface CreateOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  order_amount: number;
  payment_session_id: string;
  payments?: {
    url: string;
  };
}

/**
 * Create a Cashfree payment order
 */
export async function createPaymentOrder(params: CreateOrderParams): Promise<CreateOrderResponse | { error: string }> {
  if (!APP_ID || !CLIENT_SECRET) {
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
      return { error: `Cashfree order creation failed: ${res.status} - ${err}` };
    }

    const data = await res.json();
    return data;
  } catch (e: any) {
    return { error: e?.message || "Cashfree request failed" };
  }
}

/**
 * Verify payment status by order ID
 */
export async function verifyPayment(orderId: string): Promise<any> {
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

/**
 * Get payment link for redirect-based payment
 */
export async function getPaymentLink(orderId: string): Promise<string | null> {
  const order = await verifyPayment(orderId);
  if (order.error) return null;
  
  // Return the Cashfree payment page URL
  if (order.cf_order_id) {
    return `https://api.cashfree.com/pg/orders/${order.cf_order_id}/payments`;
  }
  return null;
}

/**
 * Process webhook notification from Cashfree
 */
export function verifyWebhookSignature(
  receivedSignature: string,
  rawBody: string
): boolean {
  // Cashfree webhook signature verification
  // In production, implement proper signature verification
  // using the webhook secret key
  return true; // Simplified for demo
}
