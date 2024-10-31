const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

function initialize() {
    return new Promise ((resolve, reject) => {
        let itemsPath = path.join(__dirname, '/data/items.json');
        let categoriesPath = path.join(__dirname, '/data/categories.json');
        fs.readFile(itemsPath, 'utf8', (err, data) => {
            if (err){
                reject(err);
            }
            else {
                items = JSON.parse(data);
                
            }
            fs.readFile(categoriesPath, 'utf8', (err, data) => {
                if (err){
                    reject(err);
                }
                else {
                    categories = JSON.parse(data);
                }
                resolve (items, categories);
            });
        });
    });
}
function getAllItems(){
    return new Promise ((resolve, reject) => {
        if (items.length < 1){
            reject('No data found in items file.');
        }
        else {
            resolve(items);
        }
    });
}

function getPublishedItems() {
    return new Promise ((resolve, reject) => {
        let publishedList = items.filter(product => product.published === true);

        if (publishedList.length < 1){
            reject('No published products were found.');
        }
        else {
            resolve(publishedList);
            
        }
    });
}

function getCategories() {
    return new Promise ((resolve, reject) => {
        if (categories.length < 1){
            reject('No data found in categories file.');
        }
        else {
            resolve(categories);
        }
    });
}

function getItemsByCategory(categoryNum) {
    return new Promise((resolve, reject) => {
        // Convert categoryNum to an integer
        categoryNum = parseInt(categoryNum);

        if (isNaN(categoryNum) || categoryNum < 1 || categoryNum > categories.length) {
            reject('This category does not exist in our files. Search for another category.');
        } else {
            const itemCategoryList = items.filter(item => item.category === categoryNum);
            
            if (itemCategoryList.length > 0) {
                console.log("An array of the filtered category number was successfully created.");
                resolve(itemCategoryList);
            } else {
                reject(`No items were found in category #${categoryNum}`);
            }
        }
    });
}


function getItemsByMinDate(minDateStr)
{
    let itemPostDateList = [];

    return new Promise ((resolve, reject) => {
        for (let i = 0; i < items.length; i++) {
            if(new Date(items[i].postDate) >= new Date(minDateStr)){
                console.log(`The postDate value is greater than minDateStr: ${items[i].postDate}`);
                itemPostDateList.push(items[i]);
            }
            else {
                console.log(`The postDate value is less than minDateStr: ${items[i].postDate}`);
            }
        }

        if (itemPostDateList.length < 1) {
            console.error(`There is no item that has been posted for ${minDatestr}`);
            reject(itemPostDateList);
        }

        resolve(itemPostDateList);
        
    });

}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(specialItem => specialItem.id === parseInt(id)); // Use find to get a single item and convert id to number

        if (item) {
            console.log(`The item with the unique id: ${id} was found.`);
            resolve(item);
        } else {
            console.error(`The item with the unique id: ${id} could not be found. Try another product ID.`);
            reject("No result returned");
        }
    });
}


function addItem(itemData) {
    return new Promise((resolve, reject) => {
        // Set the default value for the "published" property if not defined
        itemData.published = itemData.published === undefined ? false : itemData.published;

        // Assign a new ID to the item (assuming IDs are sequential)
        itemData.id = items.length + 1;

        // Add the new item to the in-memory array
        items.push(itemData);

        // Write the updated array to items.json
        fs.writeFile(path.join(__dirname, '/data/items.json'), JSON.stringify(items, null, 2), 'utf8', (err) => {
            if (err) {
                reject('Error writing to items.json');
            } else {
                resolve(itemData);
            }
        });
    });
}

module.exports = {initialize, getAllItems, getPublishedItems, getCategories, getItemsByCategory, getItemsByMinDate, getItemById, addItem};