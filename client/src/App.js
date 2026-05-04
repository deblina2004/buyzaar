import { useEffect, useState, useCallback } from "react";

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
  const [selectedSite, setSelectedSite] = useState("All");
  const [wishlist, setWishlist] = useState([]);

  // 🔥 Fetch (API + min/max)
  const fetchData = useCallback(() => {
    setLoading(true);

    fetch(
      `http://localhost:5000/real-products?q=${search}&min=${minPrice}&max=${maxPrice}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.log("API Error:", data);
          setProducts([]);
        }
        setLoading(false);
      });
  }, [search, minPrice, maxPrice]);

  // 🔥 Live search (debounce)
  useEffect(() => {
    const delay = setTimeout(fetchData, 500);
    return () => clearTimeout(delay);
  }, [fetchData]);

  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // 🔥 Unique site list
  const sites = [
    "All",
    ...new Set(
      (Array.isArray(products) ? products : [])
        .map((p) => p.site)
        .filter(Boolean),
    ),
  ];
  const toggleWishlist = (product) => {
    const exists = wishlist.find((item) => item.link === product.link);

    if (exists) {
      setWishlist(wishlist.filter((item) => item.link !== product.link));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const isInWishlist = (link) => {
    return wishlist.some((item) => item.link === link);
  };

  // 🔥 Filter + Sort (frontend)
  let filteredProducts = Array.isArray(products) ? [...products] : [];

  if (selectedSite !== "All") {
    filteredProducts = filteredProducts.filter((p) => p.site === selectedSite);
  }

  filteredProducts.sort((a, b) =>
    sortOrder === "asc" ? a.price - b.price : b.price - a.price,
  );
  const inputStyle = {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "15px",
    padding: "15px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    transition: "0.3s",
  };

  const imgStyle = {
    width: "100%",
    borderRadius: "10px",
    marginBottom: "10px",
  };

  const buyBtn = {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#667eea",
    color: "white",
    cursor: "pointer",
    marginTop: "10px",
  };

  const wishlistBtn = {
    width: "100%",
    padding: "8px",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    marginTop: "10px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1f1c2c, #928dab)",
        padding: "30px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "white",
          fontSize: "2.5rem",
          marginBottom: "20px",
        }}
      >
        🛍️ BUYZAAR 🛍️
      </h1>

      {/* 🔍 Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Min ₹"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Max ₹"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={inputStyle}
        />

        <select
          onChange={(e) => setSortOrder(e.target.value)}
          style={inputStyle}
        >
          <option value="asc">Low → High</option>
          <option value="desc">High → Low</option>
        </select>

        <select
          onChange={(e) => setSelectedSite(e.target.value)}
          style={inputStyle}
        >
          {sites.map((s, i) => (
            <option key={i}>{s}</option>
          ))}
        </select>
      </div>

      {/* ❤️ Wishlist */}
      {wishlist.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ color: "white" }}>❤️ Wishlist</h2>
          <div style={gridStyle}>
            {wishlist.map((p, i) => (
              <div key={i} style={cardStyle}>
                <img src={p.image} style={imgStyle} alt="" />
                <h4>{p.name}</h4>
                <p>₹{p.price}</p>
                <button style={buyBtn} onClick={() => window.open(p.link)}>
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⏳ Loading */}
      {loading && <h2 style={{ color: "white" }}>Loading...</h2>}

      {/* ❌ Empty */}
      {!loading && filteredProducts.length === 0 && (
        <h2 style={{ color: "white" }}>No products 😢</h2>
      )}

      {/* 📦 Products */}
      <div style={gridStyle}>
        {filteredProducts.map((p, i) => (
          <div key={i} style={cardStyle}>
            <img src={p.image} style={imgStyle} alt="" />

            <h3>{p.name}</h3>

            <p style={{ fontWeight: "bold", fontSize: "18px" }}>₹{p.price}</p>

            <p style={{ color: "#555" }}>{p.site}</p>

            {i === 0 && (
              <span style={{ color: "green", fontWeight: "bold" }}>
                🔥 Best Deal
              </span>
            )}

            <button
              onClick={() => toggleWishlist(p)}
              style={{
                ...wishlistBtn,
                background: isInWishlist(p.link) ? "#ff4d6d" : "#aaa",
              }}
            >
              {isInWishlist(p.link) ? "❤️ Remove" : "🤍 Wishlist"}
            </button>

            <button style={buyBtn} onClick={() => window.open(p.link)}>
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
