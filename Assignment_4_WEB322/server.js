/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Ali Riza Sevgili 
   Student ID: 135200228 
   Date: 11/20/2024
*
*  Cyclic Web App URL: 
* 
*  GitHub Repository URL: https://github.com/AliRizaSevgili/WEB322---Web-Programming-Tools-and-Frameworks/tree/main/Assignment_3_WEB322
*
********************************************************************************/ 

const express = require('express');
const exphbs = require('express-handlebars');
const storeService = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Initialize express app
const app = express();

// Set the port to process.env.PORT or default to 8080
const PORT = process.env.PORT || 8080;

// Configure Handlebars as the view engine
const hbsHelpers = {
  navLink: function (url, options) {
    const isActive = app.locals.activeRoute === url;
    return `<li class="nav-item"><a class="nav-link ${
      isActive ? 'active' : ''
    }" href="${url}">${options.fn(this)}</a></li>`;
  },
};
app.engine('.hbs', exphbs.engine({ extname: '.hbs', helpers: hbsHelpers }));
app.set('view engine', '.hbs');

// Set up Cloudinary configuration
cloudinary.config({
  cloud_name: 'dnlfdnusx',
  api_key: '162543641472647',
  api_secret: 'yvEBuOIkX5x1aBQseJFALD83eAE',
  secure: true
});

const upload = multer(); // Initialize multer without disk storage

// Middleware to serve static files from the "public" folder
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to set active route
app.use((req, res, next) => {
  let route = req.path.substring(1);
  app.locals.activeRoute = `/${route}`;
  next();
});

// Route for the root URL ("/") to redirect to the "/about" page
app.get('/', (req, res) => {
  res.redirect('/shop');
});

// Route to serve the about.hbs file from the "views" folder
app.get('/about', (req, res) => {
  res.render('about');
});

// Route for shop (all published items)
app.get('/shop', (req, res) => {
  const category = req.query.category;
  const id = req.query.id;
  let viewData = {};

  if (id) {
    storeService.getItemById(id)
      .then((item) => {
        viewData.post = item;
        return storeService.getPublishedItems();
      })
      .then((items) => {
        viewData.posts = items;
        return storeService.getCategories();
      })
      .then((categories) => {
        viewData.categories = categories;
      })
      .catch(() => {
        viewData.message = "No item found.";
      })
      .finally(() => {
        res.render('shop', { data: viewData });
      });
  } else if (category) {
    storeService.getItemsByCategory(category)
      .then((filteredItems) => {
        viewData.filteredPosts = filteredItems;
        return storeService.getPublishedItems();
      })
      .then((items) => {
        viewData.posts = items;
        return storeService.getCategories();
      })
      .then((categories) => {
        viewData.categories = categories;
      })
      .catch(() => {
        viewData.message = "No items found for this category.";
      })
      .finally(() => {
        res.render('shop', { data: viewData });
      });
  } else {
    storeService.getPublishedItems()
      .then((items) => {
        viewData.posts = items;
        viewData.filteredPosts = items;
        return storeService.getCategories();
      })
      .then((categories) => {
        viewData.categories = categories;
      })
      .catch(() => {
        viewData.message = "No items found.";
      })
      .finally(() => {
        res.render('shop', { data: viewData });
      });
  }
});

// Route for items
app.get('/items', (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;

  if (category) {
    storeService.getItemsByCategory(category)
      .then((items) => res.render('items', { items }))
      .catch(() => res.render('items', { message: 'No items found for this category' }));
  } else if (minDate) {
    storeService.getItemsByMinDate(minDate)
      .then((items) => res.render('items', { items }))
      .catch(() => res.render('items', { message: 'No items found for this date range' }));
  } else {
    storeService.getAllItems()
      .then((items) => res.render('items', { items }))
      .catch(() => res.render('items', { message: 'No items found' }));
  }
});

// Route for categories
app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then((categories) => res.render('categories', { categories }))
    .catch(() => res.render('categories', { message: 'No categories found' }));
});

// Route to render the add item page
app.get('/items/add', (req, res) => {
  res.render('addItem');
});

// Route for adding a new item with image upload
app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    }).catch((err) => {
      res.status(500).send("Failed to upload image.");
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body)
      .then(() => {
        res.redirect('/items');
      })
      .catch((err) => {
        res.status(500).send("Unable to add item");
      });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).render('404');
});

// Initialize the data from JSON files before starting the server
storeService.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Express http server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('Failed to initialize the store service:', err);
  });
