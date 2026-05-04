const express = require("express");
const cors = require("cors");
const axios = require("axios");

require("dotenv").config();

const app = express();
app.use(cors());

app.get("/go", (req, res) => {
  const url = req.query.url;

  if (!url || !url.startsWith("http")) {
    return res.send("Invalid URL");
  }

  res.redirect(url);
});

// 🔥 Real Products API (SerpAPI)
app.get("/real-products", async (req, res) => {
  const query = req.query.q || "shoes";
  const min = parseInt(req.query.min);
  const max = parseInt(req.query.max);

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_shopping",
        q: query,
        api_key: process.env.SERPAPI_KEY ,
        gl: "in",
        hl: "en",
      },
    });

    const items = response.data.shopping_results || [];

    // 🔄 Format data
    let results = items.map((item) => {
      const realLink =
        item.redirect_link || item.product_link || item.link || "";

      const price = parseInt(item.price?.replace(/[^0-9]/g, "")) || 0;

      const originalPrice =
        parseInt(item.extracted_price_before_discount) ||
        parseInt(item.original_price?.replace(/[^0-9]/g, "")) ||
        price;

      // 🔥 Discount calculate
      const discount =
        originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      return {
        name: item.title,
        price: price,
        originalPrice: originalPrice,
        discount: discount,

        site:
          item.source ||
          (realLink.includes("amazon") && "Amazon") ||
          (realLink.includes("flipkart") && "Flipkart") ||
          (realLink.includes("myntra") && "Myntra") ||
          (realLink.includes("meesho") && "Meesho") ||
          "Other",

        rating: item.rating || null,
        reviews: item.reviews || 0,

        availability:
          item.availability || (price > 0 ? "In Stock" : "Out of Stock"),
        // 🔥 backend redirect use কর
        link: `http://localhost:5000/go?url=${encodeURIComponent(realLink)}`,

        image: item.thumbnail,
      };
    });

    // ❌ Remove invalid price (optional but recommended)
    results = results.filter((p) => {
      const site = p.site?.toLowerCase() || "";
      return (
        site.includes("amazon") ||
        site.includes("flipkart") ||
        site.includes("myntra") ||
        site.includes("meesho")
    );
  });
    // 🎯 Apply Min Filter
    if (!isNaN(min)) {
      results = results.filter((p) => p.price >= min);
    }

    // 🎯 Apply Max Filter
    if (!isNaN(max)) {
      results = results.filter((p) => p.price <= max);
    }

    // 🔥 Sort by price (low → high)
    results.sort((a, b) => a.price - b.price);

    res.json(results);
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "API failed" });
  }
});

// 🚀 Server Start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
