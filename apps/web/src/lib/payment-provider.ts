/**
 * Prism Commerce OS — Provider-Agnostic Payment Abstraction
 * 
 * Defines a clean, gateway-agnostic interface for processing transactions.
 * Supported providers: Stripe, Razorpay, PayPal, or Demo Mock Provider.
 */

export interface PaymentRequestPayload {
  amount: number;
  currency: string;
  paymentMethod: "card" | "apple_pay" | "google_pay" | "paypal" | "upi";
  cardDetails?: {
    number: string;
    exp: string;
    cvv: string;
    name: string;
  };
  couponCode?: string;
  items: Array<{ id: string; title: string; price: number; quantity: number }>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  orderId: string;
  amountPaid: number;
  currency: string;
  timestamp: string;
  estimatedDelivery: string;
  errorMessage?: string;
}

export interface PaymentAdapter {
  name: string;
  processPayment(payload: PaymentRequestPayload): Promise<PaymentResult>;
  verifyFraudRisk(payload: PaymentRequestPayload): Promise<{ riskScore: number; status: "LOW" | "MEDIUM" | "HIGH" }>;
}

/**
 * Mock Provider for Hackathon Demonstrations
 * Simulates gateway processing, bank authorization, and fraud verification.
 */
export class MockPaymentProvider implements PaymentAdapter {
  name = "Prism Mock Payment Gateway (Stripe-Compatible)";

  async processPayment(payload: PaymentRequestPayload): Promise<PaymentResult> {
    // Artificial latency for step simulation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const randId = Math.floor(10000 + Math.random() * 90000);
    const date = new Date();
    date.setDate(date.getDate() + 1); // Tomorrow

    return {
      success: true,
      transactionId: `tx_prism_${Date.now()}`,
      orderId: `PRSM-${randId}`,
      amountPaid: payload.amount,
      currency: payload.currency || "USD",
      timestamp: new Date().toISOString(),
      estimatedDelivery: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    };
  }

  async verifyFraudRisk(payload: PaymentRequestPayload) {
    return {
      riskScore: 0.02,
      status: "LOW" as const,
    };
  }
}

// Default payment engine instance
export const activePaymentEngine: PaymentAdapter = new MockPaymentProvider();
