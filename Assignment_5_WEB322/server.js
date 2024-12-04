/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Ali Riza Sevgili 
*  Student ID: 135200228 
*  Date: 12/04/2024
*
*  Cyclic Web App URL: 
*  GitHub Repository URL: https://github.com/AliRizaSevgili/WEB322---Web-Programming-Tools-and-Frameworks/tree/main/Assignment_5_WEB322
********************************************************************************/

const express = require("express");
const itemData = require("./store-service");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");


const app = express();
const PORT = process.env.PORT || 8080;



// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const upload = multer();

cloudinary.config({
  cloud_name: "dnlfdnusx",         // Cloudinary'deki Cloud Name
  api_key: "162543641472647",     // Cloudinary'deki API Key
  api_secret: "yvEBuOIkX5x1aBQseJFALD83eAE" // Cloudinary'deki API Secret
});


// Handlebars Setup
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return `<li class="nav-item"><a class="nav-link${url === app.locals.activeRoute ? " active" : ""}" href="${url}">${options.fn(this)}</a></li>`;
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        let day = dateObj.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      },
      formatCurrency: function (value) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      },
    },
  })
);
app.set("view engine", ".hbs");

app.use((req, res, next) => {
  app.locals.activeRoute = req.path.replace(/\/$/, "");
  next();
});

// Routes
app.get("/", (req, res) => res.redirect("/about"));

app.get("/about", (req, res) => res.render("about"));

app.get("/shop", async (req, res) => {
  let viewData = {};

  try {
    const items = req.query.category
      ? await itemData.getPublishedItemsByCategory(req.query.category)
      : await itemData.getPublishedItems();

    viewData.items = items.length > 0 ? items : [];
    viewData.message = items.length === 0 ? "No items available" : null;
    viewData.item = items[0];
  } catch (err) {
    console.error("Error fetching items:", err);
    viewData.message = "Error fetching items";
  }

  try {
    viewData.categories = await itemData.getCategories();
  } catch (err) {
    console.error("Error fetching categories:", err);
    viewData.categoriesMessage = "No categories available";
  }

  res.render("shop", { data: viewData });
});

app.get("/categories", async (req, res) => {
  try {
    const categories = await itemData.getCategories();
    if (categories.length > 0) {
      res.render("categories", { categories });
    } else {
      res.render("categories", { message: "No Categories Available" });
    }
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.render("categories", { message: "No Categories Available" });
  }
});

app.get("/categories/add", (req, res) => res.render("addCategory"));

app.post("/categories/add", async (req, res) => {
  try {
    await itemData.addCategory(req.body);
    res.redirect("/categories");
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).send("Unable to Add Category");
  }
});

app.get("/categories/delete/:id", async (req, res) => {
  try {
    await itemData.deleteCategoryById(req.params.id);
    res.redirect("/categories");
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).send("Unable to Remove Category");
  }
});

app.get("/items", async (req, res) => {
  try {
    const items = req.query.category
      ? await itemData.getItemsByCategory(req.query.category)
      : await itemData.getAllItems();

    res.render("items", {
      items: items.length > 0 ? items : [],
      message: items.length === 0 ? "No Items Available" : null,
    });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.render("items", { message: "Error fetching items" });
  }
});

app.get("/items/add", async (req, res) => {
  try {
    const categories = await itemData.getCategories();
    res.render("addItem", { categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.render("addItem", { categories: [] });
  }
});

app.post("/items/add", upload.single("featureImage"), async (req, res) => {
  try {
    if (req.file) {
      const streamUpload = (req) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const uploaded = await streamUpload(req);
      req.body.featureImage = uploaded.url;
    } else {
      req.body.featureImage = null;
    }

    req.body.published = req.body.published === "on";
    req.body.itemDate = new Date();

    await itemData.addItem(req.body);
    res.redirect("/items");
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).send("Unable to Add Item");
  }
});

app.get("/items/delete/:id", async (req, res) => {
  try {
    await itemData.deleteItemById(req.params.id);
    res.redirect("/items");
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Unable to Remove Item");
  }
});

app.use((req, res) => {
  console.error(`404 error: Page not found - ${req.originalUrl}`);
  res.status(404).render("404");
});

// Initialize Database and Start Server
itemData
  .initialize()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => console.error(`Unable to start server: ${err}`));
