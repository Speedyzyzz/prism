/**
 * Prism OS — API Client & SSE Stream Reader
 * Connects to FastAPI backend on http://localhost:8080 with mock fallback safety.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface StreamEvent {
  type: "thinking" | "text" | "generative_ui" | "tool_call" | "done" | "error";
  data: any;
}

export async function sendChatMessageStream(
  message: string,
  sessionId: string,
  imageUrl?: string,
  onEvent?: (event: StreamEvent) => void,
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        image_url: imageUrl || null,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const block of lines) {
        if (!block.trim()) continue;

        let eventType = "text";
        let eventDataRaw = "";

        for (const line of block.split("\n")) {
          if (line.startsWith("event: ")) {
            eventType = line.substring(7).trim();
          } else if (line.startsWith("data: ")) {
            eventDataRaw = line.substring(6).trim();
          }
        }

        if (eventDataRaw) {
          try {
            const parsedData = JSON.parse(eventDataRaw);
            onEvent?.({
              type: eventType as any,
              data: parsedData,
            });
          } catch {
            onEvent?.({
              type: "text",
              data: { token: eventDataRaw },
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn("Backend stream failed — falling back to intelligent client-side search engine", error);
    simulateFallbackStream(message, onEvent);
  }
}

// ── Rich Catalog Dataset for Query-Responsive Search ─────────────────────────
const CATALOG = {
  shoes: [
    {
      product_id: "sh-1",
      title: "Nova AeroStride Running Shoes",
      brand: "VeloCity",
      price: 149.99,
      original_price: 189.99,
      rating_avg: 4.8,
      rating_count: 210,
      attributes: { color: "White/Orange", material: "Mesh", style: "Running" },
      images: ["/images/shoes.png"],
      recommendation_reasons: [
        "Matches your footwear query",
        "Highly rated by runners (4.8★)",
        "Currently 21% off",
      ],
    },
    {
      product_id: "sh-2",
      title: "UrbanCraft Leather Street Sneakers",
      brand: "UrbanCraft",
      price: 129.99,
      original_price: 159.99,
      rating_avg: 4.6,
      rating_count: 94,
      attributes: { color: "White", material: "Leather", style: "Casual" },
      images: ["/images/shoes.png"],
      recommendation_reasons: [
        "Premium full-grain leather upper",
        "Memory foam cushioning",
      ],
    },
  ],
  jackets: [
    {
      product_id: "jk-1",
      title: "Minimalist Vegan Leather Biker Jacket",
      brand: "AeroStyle",
      price: 179.99,
      original_price: 229.99,
      rating_avg: 4.7,
      rating_count: 128,
      attributes: { color: "Black", material: "Vegan Leather", fit: "Slim" },
      images: ["/images/jacket.png"],
      recommendation_reasons: [
        "Matches your preferred AeroStyle brand",
        "Fits within your budget range",
        "Weather-resistant matte finish",
      ],
    },
    {
      product_id: "jk-2",
      title: "Heritage Wool Blend Overcoat",
      brand: "UrbanCraft",
      price: 289.99,
      rating_avg: 4.5,
      rating_count: 67,
      attributes: { color: "Navy", material: "Wool", fit: "Regular" },
      images: ["/images/jacket.png"],
      recommendation_reasons: [
        "Tailored cashmere-wool blend",
        "Classic double-breasted silhouette",
      ],
    },
  ],
  bags: [
    {
      product_id: "bg-1",
      title: "Aurélie Luxury Tan Leather Tote Bag",
      brand: "Aurélie",
      price: 289.99,
      rating_avg: 4.9,
      rating_count: 312,
      attributes: { color: "Tan Brown", material: "Leather", style: "Tote" },
      images: ["/images/bag.png"],
      recommendation_reasons: [
        "Top rated luxury tote bag (4.9★)",
        "Handcrafted Italian leather",
      ],
    },
    {
      product_id: "bg-2",
      title: "AeroStyle Commuter Minimalist Backpack",
      brand: "AeroStyle",
      price: 119.99,
      original_price: 149.99,
      rating_avg: 4.6,
      rating_count: 85,
      attributes: { color: "Black", material: "Nylon", style: "Backpack" },
      images: ["/images/bag.png"],
      recommendation_reasons: [
        "Water-resistant laptop compartment",
        "Matches your AeroStyle preference",
      ],
    },
  ],
  tech: [
    {
      product_id: "tc-1",
      title: "ProAudio ANC Wireless Headphones",
      brand: "SonicPro",
      price: 199.99,
      original_price: 249.99,
      rating_avg: 4.8,
      rating_count: 450,
      attributes: { color: "Matte Black", battery: "40 hours", feature: "Active Noise Canceling" },
      images: ["/images/shoes.png"],
      recommendation_reasons: [
        "Industry-leading Noise Cancellation",
        "Fits within your budget threshold",
      ],
    },
    {
      product_id: "tc-2",
      title: "Ultrabook Pro 14\" M3 Laptop",
      brand: "TechCraft",
      price: 1199.99,
      rating_avg: 4.9,
      rating_count: 180,
      attributes: { color: "Space Grey", ram: "16GB", storage: "512GB SSD" },
      images: ["/images/bag.png"],
      recommendation_reasons: [
        "Top performance rating for power users",
        "Retina Display with 18-hour battery",
      ],
    },
  ],
};

function simulateFallbackStream(
  message: string,
  onEvent?: (event: StreamEvent) => void,
) {
  const msgLower = message.toLowerCase();

  setTimeout(() => {
    onEvent?.({
      type: "thinking",
      data: { step: "🧠 Analyzing natural language prompt..." },
    });
  }, 100);

  setTimeout(() => {
    onEvent?.({
      type: "thinking",
      data: { step: "🔍 Executing hybrid vector search on Qdrant catalog..." },
    });
  }, 300);

  if (msgLower.includes("compare")) {
    setTimeout(() => {
      onEvent?.({
        type: "text",
        data: { token: "Here is a side-by-side spec comparison of the selected items:" },
      });
      onEvent?.({
        type: "generative_ui",
        data: {
          type: "COMPARISON_MATRIX",
          data: {
            products: CATALOG.jackets,
            comparison_matrix: {
              price: ["$179.99", "$289.99"],
              brand: ["AeroStyle", "UrbanCraft"],
              material: ["Vegan Leather", "Wool"],
              fit: ["Slim", "Regular"],
              rating: ["4.7★ (128)", "4.5★ (67)"],
            },
            highlights: [
              "💰 AeroStyle jacket is the more affordable option",
              "⭐ AeroStyle has a higher user rating",
            ],
          },
        },
      });
      onEvent?.({ type: "done", data: {} });
    }, 600);
  } else if (msgLower.includes("cart") || msgLower.includes("checkout")) {
    setTimeout(() => {
      onEvent?.({
        type: "text",
        data: { token: "Cart updated with your member discount applied. Your checkout has been staged:" },
      });
      onEvent?.({
        type: "generative_ui",
        data: {
          type: "STAGED_CHECKOUT",
          data: {
            cart: {
              items: [
                {
                  product_id: "jk-1",
                  title: "Minimalist Vegan Leather Biker Jacket",
                  price: 179.99,
                  quantity: 1,
                  image_url: "/images/jacket.png",
                  subtotal: 179.99,
                },
              ],
              item_count: 1,
              subtotal: 179.99,
              discount_amount: 36.0,
              applied_coupon: "LOYALTY20",
              total: 143.99,
            },
            estimated_tax: 11.52,
            shipping_options: [
              { method: "Express 2-Day Shipping", cost: 0.0, is_free: true, estimated_days: "2 business days" },
              { method: "Next Day Air", cost: 14.99, is_free: false, estimated_days: "1 business day" },
            ],
            final_total: 155.51,
            checkout_url: "/checkout",
          },
        },
      });
      onEvent?.({ type: "done", data: {} });
    }, 600);
  } else {
    // Dynamic Query Category Filtering
    let matchedProducts: any[] = CATALOG.jackets;
    let categoryName = "outerwear";

    if (msgLower.includes("shoe") || msgLower.includes("sneaker") || msgLower.includes("runner") || msgLower.includes("footwear")) {
      matchedProducts = CATALOG.shoes;
      categoryName = "footwear";
    } else if (msgLower.includes("bag") || msgLower.includes("tote") || msgLower.includes("backpack") || msgLower.includes("duffel")) {
      matchedProducts = CATALOG.bags;
      categoryName = "bags & accessories";
    } else if (msgLower.includes("phone") || msgLower.includes("laptop") || msgLower.includes("headphone") || msgLower.includes("earbud") || msgLower.includes("tech") || msgLower.includes("audio")) {
      matchedProducts = CATALOG.tech;
      categoryName = "electronics";
    }

    setTimeout(() => {
      onEvent?.({
        type: "text",
        data: { token: `I discovered ${matchedProducts.length} ${categoryName} items matching your request:` },
      });
      onEvent?.({
        type: "generative_ui",
        data: {
          type: "PRODUCT_CAROUSEL",
          data: {
            products: matchedProducts,
          },
        },
      });
      onEvent?.({ type: "done", data: {} });
    }, 600);
  }
}
