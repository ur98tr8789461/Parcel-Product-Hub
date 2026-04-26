import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const sessions = {}; // temporary (resets on restart)

/* AUTH */
app.post("/auth", async (req, res) => {
  const { apiKey } = req.body;

  try {
    const test = await fetch("https://v2.parcelroblox.com/products/all", {
      headers: { Authorization: apiKey },
    });

    if (!test.ok) {
      return res.status(401).json({ error: "Invalid key" });
    }

    const token = crypto.randomBytes(16).toString("hex");
    sessions[token] = apiKey;

    res.json({ token });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* GET PRODUCTS */
app.get("/products", async (req, res) => {
  const token = req.headers.authorization;
  const apiKey = sessions[token];

  if (!apiKey) return res.status(401).send("Unauthorized");

  const response = await fetch("https://v2.parcelroblox.com/products/all", {
    headers: { Authorization: apiKey },
  });

  res.json(await response.json());
});

/* UPDATE PRODUCT */
app.patch("/products/:id", async (req, res) => {
  const token = req.headers.authorization;
  const apiKey = sessions[token];

  if (!apiKey) return res.status(401).send("Unauthorized");

  const response = await fetch(
    `https://v2.parcelroblox.com/products/update/${req.params.id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }
  );

  res.json(await response.json());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
