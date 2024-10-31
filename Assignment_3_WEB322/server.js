/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Ali Riza Sevgili 
   Student ID: 135200228 
   Date: 
*
*  Cyclic Web App URL: ________________________________________________________
* 
*  GitHub Repository URL: ______________________________________________________
*
********************************************************************************/ 


const express = require('express');
const storeService = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: 'dnlfdnusx',
  api_key: '162543641472647',
  api_secret: 'yvEBuOIkX5x1aBQseJFALD83eAE',
  secure: true
});

const upload = multer();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

//create the routes
app.get('/', (req, res)=> {
    res.redirect('/about');
});

app.get('/about', (req, res)=> {
    res.sendFile(__dirname + '/views/about.html');
});

app.get('/items/add', (req, res)=> {
    res.sendFile(__dirname + '/views/addItem.html');
});

app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then((publishedItems) => {
            res.json(publishedItems);
        })
        .catch((err) => {
            res.status(500).json({message: err});
        });
});

app.get('/items', (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;

    if (category) {
        if (['1', '2', '3', '4', '5'].includes(category)) {
            storeService.getItemsByCategory(category).then((items) => {
                res.json(items);
            }).catch((err) => {
                res.status(500).json({ message: String(err) });  
            });
        } else {
            res.status(400).json({ message: "Invalid category value" });
        }
    } else if (minDate) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(minDate)) {
            storeService.getItemsByMinDate(minDate).then((items) => {
                res.json(items);
            }).catch((err) => {
                res.status(500).json({ message: String(err) }); 
            });
        } else {
            res.status(400).json({ message: "Invalid date format" });
        }
    } else {
        storeService.getAllItems().then((items) => {
            res.json(items);
        }).catch((err) => {
            res.status(500).json({ message: String(err) });  
        });
    }
});


app.get('/categories', (req, res) => {
    storeService.getCategories()
    .then((categories) => {
        res.json(categories);
    })
    .catch((err) => {
        res.status(500).json({message:err});
    });
});

app.get('/item/:value', (req, res) => {
    const id = req.params.value;
    storeService.getItemById(id).then((item) => {
        res.json(item);
    }).catch((err) => {
        res.status(404).json({message: err});
    });
});

// POST route for adding items with image upload
app.post('/items/add', upload.single('featureImage'), (req, res) => {
    if(req.file) {
        console.log("File received:", req.file);  // File logging for debugging

        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        console.log("Cloudinary upload result:", result); 
                        resolve(result);
                    } else {
                        console.log("Cloudinary upload error:", error); 
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((err) => {
            console.error("Cloudinary uploaded failed: ", err);
            res.status(500).send("Image upload failed");
        });
    } else {
        console.log("No file uploaded!");  // If no file is uploaded
        processItem("");  // Proceed without image
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;  // Add image URL to the request body

        // Check for form data
        console.log("Form data received:", req.body);  

        // Add the item using storeService
        storeService.addItem(req.body)
        .then(() => {
            console.log("Item successfully added!"); 
            res.redirect('/items');
        })
        .catch((err) => {
            console.error("Error adding item:", err); 
            res.status(500).send("Unable to add item"); 
        });
    }
});

app.use((req, res)=> {
    res.status(404).send('Page not Found');
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log('Failed to initialize the store service:', err);
    });
