const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

// ----------------------
// ENV SECURITY
// ----------------------
const API_KEY = process.env.API_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ----------------------
// DATA
// ----------------------
const getProducts = () => {
  return JSON.parse(fs.readFileSync("./products.json"));
};

const saveProducts = (data) => {
  fs.writeFileSync("./products.json", JSON.stringify(data, null, 2));
};

// ----------------------
// LOGIN (simple password check)
// ----------------------
app.post("/login", (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong password" });
  }

  // super simple “session token”
  const token = "admin-" + Date.now();

  res.json({ token });
});

// ----------------------
// API AUTH middleware
// ----------------------
app.use((req, res, next) => {
  // allow login route
  if (req.path === "/login") return next();

  // check API key for everything else
  const key = req.headers["x-api-key"];

  if (key !== API_KEY) {
    return res.status(401).json({ error: "No API key" });
  }

  next();
});

// ----------------------
// ROUTES
// ----------------------
app.get("/", (req, res) => {
  res.send("Secure Product API 🔐");
});

// GET all products
app.get("/products", (req, res) => {
  res.json(getProducts());
});

// GET product
app.get("/products/:id", (req, res) => {
  const product = getProducts().find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Not found" });
  }

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
// START SERVER
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
