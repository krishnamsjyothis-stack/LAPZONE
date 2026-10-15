import "dotenv/config";

const BASE_URL = "http://localhost:5000/api";

const TOKEN = "PASTE_CUSTOMER_JWT_TOKEN_HERE";
const PRODUCT_ID = "6acddce175aea7f0c9c9a11a";

async function testReview() {
  try {
    const response = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        productId: PRODUCT_ID,
        rating: 5,
        title: "Excellent laptop",
        comment: "The laptop works well and performs smoothly.",
      }),
    });

    const data = await response.json();

    console.log("HTTP Status:", response.status);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

testReview();