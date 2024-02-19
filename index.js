const express = require("express");
const puppeteer = require("puppeteer");
const scrapeAmazon = require("./scrapeAmazon");

const app = express();
const PORT = 3000;


app.get("/api/search", async (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({ error: "Missing keyword parameter" });
  }
  try {
    const products = await scrapeAmazon(keyword);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
