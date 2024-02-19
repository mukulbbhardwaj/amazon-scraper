const puppeteer = require("puppeteer");

async function scrapeAmazon(keyword) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto(`https://www.amazon.in/s?k=${keyword}`);

  const selectors = {
    urlLink: "h2 a",
    nameElement: "h1 span#productTitle",
    ratingElement: ".a-icon-star",
    priceElement: ".a-offscreen",
    descriptionElement: ".a-list-item",
    reviewsLink: "a#acrCustomerReviewLink",
    reviewsElement: ".review-text",
  };
  const products = [];
  const hrefs = await page.$$eval(selectors.urlLink, (elements) =>
    elements.map((element) => element.getAttribute("href"))
  );
  for (let i = 0; i < 4; i++) {
    const href = hrefs[i];
    const page1 = await browser.newPage();
    await page1.goto(`https://www.amazon.in${href}`);

    const name = await page1.$eval(selectors.nameElement, (nameElement) =>
      nameElement ? nameElement.textContent.trim() : "N/A"
    );
    const rating = await page1.$eval(selectors.ratingElement, (ratingElement) =>
      ratingElement ? ratingElement.innerText.trim() : "N/A"
    );
    const price = await page1.$eval(selectors.priceElement, (priceElement) =>
      priceElement ? priceElement.innerText.trim() : "NA"
    );
    const description = await page1.$$eval(
      selectors.descriptionElement,
      (elements) =>
        elements.map((element) => element.textContent.trim()).join(" ") || "N/A"
    );

    await page1.click(selectors.reviewsLink);

    const reviews = await page1.$$eval(
      selectors.reviewsElement,
      (elements, i) =>
        elements
          .slice(0, 10) // Limit to 10 reviews
          .map((element, index) => {
            const reviewerName = element.querySelector(
              "div.a-profile-content span.a-profile-name"
            );
            const reviewText = element.textContent.trim();
            return {
              id: `Review_${i}_${index}`,
              text: reviewText,
            };
          }),
      i
    );

    const productDetails = {
      name,
      rating,
      price,
      description,
      reviews,
    };

    products.push(productDetails);
  }

  return products;
}

module.exports = scrapeAmazon;
