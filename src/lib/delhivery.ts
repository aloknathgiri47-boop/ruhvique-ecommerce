/**
 * Delhivery Courier API Integration
 * Handles: tracking, shipping rates, pincode serviceability, waybill creation
 */

const API_KEY = process.env.DELHIVERY_API_KEY;
const BASE_URL = process.env.DELHIVERY_API_BASE_URL || "https://track.delhivery.com";

interface TrackingResponse {
  status: string;
  status_code: number;
  shipment: {
    waybill: string;
    status: string;
    courier: string;
    cod_amount?: string;
    order?: string;
    client?: string;
   拣?: string;
  }[];
  packages: {
    waybill: string;
    status: string;
    client: string;
    order: string;
    cod_amount?: string;
    events: {
      status: string;
      status_code: string;
      date: string;
      time: string;
      location: string;
      remarks?: string;
    }[];
  }[];
}

interface PincodeResponse {
  delivery_codes: {
    postal_code: {
      pre_paid: string;
      cash: string;
      pickup: string;
      cod: string;
      state_code: string;
      city: string;
    };
  }[];
  status: string;
}

/**
 * Track a shipment by waybill number
 */
export async function trackShipment(waybill: string): Promise<any> {
  if (!API_KEY) {
    return { error: "Delhivery API key not configured" };
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/packages/json/?waybill=${waybill}`, {
      headers: {
        "Authorization": `Token ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return { error: `Tracking failed: ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (e: any) {
    return { error: e?.message || "Tracking request failed" };
  }
}

/**
 * Check if a pincode is serviceable by Delhivery
 */
export async function checkPincodeServiceability(pincode: string): Promise<any> {
  if (!API_KEY) {
    return { error: "Delhivery API key not configured" };
  }

  try {
    const res = await fetch(`${BASE_URL}/api/pin-codes/json/?pin_codes=${pincode}`, {
      headers: {
        "Authorization": `Token ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return { error: `Pincode check failed: ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (e: any) {
    return { error: e?.message || "Pincode check failed" };
  }
}

/**
 * Create a shipment / waybill
 */
export async function createShipment(shipmentData: {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  order: string;
  payment_mode: string;
  cod_amount?: string;
  weight?: string;
  products_desc: string;
}): Promise<any> {
  if (!API_KEY) {
    return { error: "Delhivery API key not configured" };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("format", "json");
    formData.append("data", JSON.stringify({
      shipments: [{
        name: shipmentData.name,
        phone: shipmentData.phone,
        order: shipmentData.order,
        products_desc: shipmentData.products_desc,
        payment_mode: shipmentData.payment_mode,
        cod_amount: shipmentData.cod_amount || "",
        weight: shipmentData.weight || "0.5",
        add: shipmentData.address,
        city: shipmentData.city,
        state: shipmentData.state,
        pin: shipmentData.pincode,
        country: "India",
      }],
      pickup_location: {
        name: "RUHVIQUE",
        city: "Bengaluru",
        pin: "560038",
        state: "Karnataka",
        country: "India",
      },
    }));

    const res = await fetch(`${BASE_URL}/api/c/create/create_order/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      return { error: `Shipment creation failed: ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (e: any) {
    return { error: e?.message || "Shipment creation failed" };
  }
}

/**
 * Get tracking status as a friendly format for the order detail page
 */
export async function getTrackingStatus(waybill: string): Promise<{
  status: string;
  location?: string;
  date?: string;
  events?: { status: string; location: string; date: string; time: string }[];
}> {
  const data = await trackShipment(waybill);

  if (data.error) {
    return { status: "Unknown", events: [] };
  }

  const packages = data.packages || [];
  if (packages.length === 0) {
    return { status: "Unknown", events: [] };
  }

  const pkg = packages[0];
  const events = (pkg.events || []).map((e: any) => ({
    status: e.status || "Unknown",
    location: e.location || "",
    date: e.date || "",
    time: e.time || "",
  }));

  return {
    status: pkg.status || "Unknown",
    location: events[0]?.location,
    date: events[0]?.date,
    events: events.reverse(), // latest first
  };
}
