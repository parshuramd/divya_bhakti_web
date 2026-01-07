interface ShiprocketAuthResponse {
  token: string;
}

interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
}

interface ShiprocketOrderData {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: 'COD' | 'Prepaid';
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

class ShiprocketService {
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.baseUrl = process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1/external';
  }

  private async getToken(): Promise<string> {
    // Return cached token if valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Shiprocket');
    }

    const data: ShiprocketAuthResponse = await response.json();
    this.token = data.token;
    // Token is valid for 10 days
    this.tokenExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    return this.token;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: object
  ): Promise<T> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Shiprocket API error');
    }

    return response.json();
  }

  async createOrder(orderData: ShiprocketOrderData): Promise<{
    order_id: number;
    shipment_id: number;
    status: string;
    status_code: number;
    onboarding_completed_now: boolean;
  }> {
    return this.request('/orders/create/adhoc', 'POST', orderData);
  }

  async getTrackingData(
    shipmentId: string
  ): Promise<{
    tracking_data: {
      track_status: number;
      shipment_status: string;
      shipment_track: Array<{
        id: number;
        activity: string;
        date: string;
        location: string;
      }>;
    };
  }> {
    return this.request(`/courier/track/shipment/${shipmentId}`);
  }

  async getTrackingByAWB(
    awbNumber: string
  ): Promise<{
    tracking_data: {
      track_status: number;
      shipment_status: string;
      shipment_track: Array<{
        id: number;
        activity: string;
        date: string;
        location: string;
      }>;
    };
  }> {
    return this.request(`/courier/track/awb/${awbNumber}`);
  }

  async generateAWB(shipmentId: number, courierId: number): Promise<{
    awb_code: string;
    awb_code_status: number;
  }> {
    return this.request('/courier/assign/awb', 'POST', {
      shipment_id: shipmentId,
      courier_id: courierId,
    });
  }

  async requestPickup(shipmentId: number): Promise<{
    pickup_scheduled_date: string;
    pickup_token_number: string;
    status: string;
  }> {
    return this.request('/courier/generate/pickup', 'POST', {
      shipment_id: [shipmentId],
    });
  }

  async cancelOrder(orderId: string): Promise<{ status: string }> {
    return this.request('/orders/cancel', 'POST', {
      ids: [orderId],
    });
  }

  async getAvailableCouriers(
    pickupPincode: string,
    deliveryPincode: string,
    weight: number,
    cod: boolean
  ): Promise<{
    data: {
      available_courier_companies: Array<{
        courier_company_id: number;
        courier_name: string;
        rate: number;
        estimated_delivery_days: string;
      }>;
    };
  }> {
    return this.request('/courier/serviceability/', 'POST', {
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight,
      cod: cod ? 1 : 0,
    });
  }

  async getPickupLocations(): Promise<{
    data: {
      shipping_address: Array<{
        id: number;
        pickup_location: string;
        name: string;
        city: string;
        state: string;
        pin_code: string;
      }>;
    };
  }> {
    return this.request('/settings/company/pickup');
  }
}

export const shiprocket = new ShiprocketService();

// Helper function to create Shiprocket order from our order
export async function createShiprocketOrder(order: {
  id: string;
  orderNumber: string;
  createdAt: Date;
  paymentMethod: string;
  subtotal: number;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    price: number;
  }>;
  address: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  user: {
    email: string;
  };
}) {
  const nameParts = order.address.fullName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || firstName;

  const orderData: ShiprocketOrderData = {
    order_id: order.orderNumber,
    order_date: order.createdAt.toISOString().split('T')[0],
    pickup_location: 'Primary',
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.address.addressLine1,
    billing_address_2: order.address.addressLine2 || '',
    billing_city: order.address.city,
    billing_pincode: order.address.pincode,
    billing_state: order.address.state,
    billing_country: 'India',
    billing_email: order.user.email,
    billing_phone: order.address.phone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      units: item.quantity,
      selling_price: Number(item.price),
    })),
    payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    sub_total: Number(order.subtotal),
    length: 20,
    breadth: 15,
    height: 10,
    weight: 0.5,
  };

  return shiprocket.createOrder(orderData);
}

