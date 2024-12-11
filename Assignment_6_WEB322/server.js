/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Ali Riza Sevgili 
*  Student ID: 135200228 
*  Date: 12/11/2024
*
*  Cyclic Web App URL: https://b36f2a32-ce2b-415d-81f9-47159a4ca62c-00-2dgtt425jcwgp.janeway.replit.dev/
                       https://b36f2a32-ce2b-415d-81f9-47159a4ca62c-00-2dgtt425jcwgp.janeway.replit.dev/
                       https://b36f2a32-ce2b-415d-81f9-47159a4ca62c-00-2dgtt425jcwgp.janeway.replit.dev/
*  GitHub Repository URL: https://github.com/AliRizaSevgili/WEB322---Web-Programming-Tools-and-Frameworks/tree/main/Assignment_6_WEB322
********************************************************************************/

const express = require("express");
const itemData = require("./store-service");
const authData = require("./auth-service"); // Import auth-service for authentication
const clientSessions = require("client-sessions"); // For session management
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
  cloud_name: "dnlfdnusx",         // Cloudinary Cloud Name
  api_key: "162543641472647",     // Cloudinary API Key
  api_secret: "yvEBuOIkX5x1aBQseJFALD83eAE" // Cloudinary API Secret
});

// Session Middleware
app.use(clientSessions({
  cookieName: "session",
  secret: "your_secret_key_here", // Replace with a secure secret key
  duration: 24 * 60 * 60 * 1000,  // Session duration: 24 hours
  activeDuration: 1000 * 60 * 60, // Extend session by 1 hour if active
  httpOnly: true,                 // Prevent client-side JS from accessing the cookie
  secure: false,                  // Use `true` if using HTTPS
  ephemeral: true                 // Deletes cookie when the browser is closed
}));

// Add session data to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
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

// Helper to ensure user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

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

app.get("/categories", ensureLogin, async (req, res) => {
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

app.get("/categories/add", ensureLogin, (req, res) => res.render("addCategory"));

app.post("/categories/add", ensureLogin, async (req, res) => {
  try {
    await itemData.addCategory(req.body);
    res.redirect("/categories");
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).send("Unable to Add Category");
  }
});

app.get("/categories/delete/:id", ensureLogin, async (req, res) => {
  try {
    await itemData.deleteCategoryById(req.params.id);
    res.redirect("/categories");
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).send("Unable to Remove Category");
  }
});

// Add authentication routes
app.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/categories");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { title: "User History", user: req.session.user });
});

// Initialize Database and Start Server
itemData
  .initialize()
  .then(authData.initialize)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => console.error(`Unable to start server: ${err}`));
