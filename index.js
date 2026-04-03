const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;

// ----------------------
// Helpers
// ----------------------
const getProducts = () => {
  return JSON.parse(fs.readFileSync("./products.json"));
};

const saveProducts = (data) => {
  fs.writeFileSync("./products.json", JSON.stringify(data, null, 2));
};

// ----------------------
// Middleware (API key protection)
// ----------------------
app.use((req, res, next) => {
  if (req.method !== "GET") {
    if (req.headers["x-api-key"] !== API_KEY) {
      return res.status(401).json({ error: "Invalid API key" });
    }
  }
  next();
});

// ----------------------
// Routes
// ----------------------
app.get("/", (req, res) => {
  res.send("Product API running 🚀");
});

// GET all products
app.get("/products", (req, res) => {
  res.json(getProducts());
});

// GET one product
app.get("/products/:id", (req, res) => {
  const product = getProducts().find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

// UPDATE product
app.put("/products/:id", (req, res) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  products[index] = {
    ...products[index],
    ...req.body
  };

  saveProducts(products);

  res.json(products[index]);
});

// ADD product
app.post("/products", (req, res) => {
  const products = getProducts();

  const newProduct = {
    id: Date.now().toString(),
    ...req.body
  };

  products.push(newProduct);
  saveProducts(products);

  res.json(newProduct);
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
