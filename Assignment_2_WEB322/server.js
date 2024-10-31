/**
* WEB322 - Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites and friends) or distributed to other students.
* I understand that if caught doing so, I will receive zero on this assignment and possibly
* fail the entire course.
* Name: Ali Riza Sevgili
* Student ID: 135200228
* Date: 10 /09 / 2024
* Replit Web App URL: https://658202f5-00e6-4916-87f4-ae394cee3412-00-1erzuh8ehqudo.spock.repl.co/about
* GitHub Repository URL: https://github.com/AliRizaSevgili/WEB322---Web-Programming-Tools-and-Frameworks/tree/main/Assignment_2_WEB322
**/

const express = require('express');
const path = require('path');
const app = express();
const storeService = require('./store-service'); 

const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/shop', (req, res) => {
  storeService.getPublishedItems()
    .then((publishedItems) => {
      res.json(publishedItems);
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then((items) => {
      res.json(items);
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then((categories) => {
      res.json(categories);
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

storeService.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Express http server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Unable to initialize data: ${err}`);
  });
