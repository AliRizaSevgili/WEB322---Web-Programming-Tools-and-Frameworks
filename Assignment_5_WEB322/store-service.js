const Sequelize = require('sequelize');

const sequelize = new Sequelize('postgresql://SenecaDB_owner:d6FYZjBKIuc7@ep-lucky-morning-a58s3mk8.us-east-2.aws.neon.tech/SenecaDB?sslmode=require', {
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
    },
    query: { raw: true },
});

const Item = sequelize.define('Item', {
    body: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    itemDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
    featureImage: Sequelize.STRING,
    published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
});

const Category = sequelize.define('Category', {
    category: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

Item.belongsTo(Category, { foreignKey: 'category' });

module.exports = {
    initialize: async () => {
        try {
            await sequelize.sync();
            console.log('Database synchronized successfully.');
        } catch (err) {
            console.error('Unable to sync the database:', err);
            throw new Error('unable to sync the database');
        }
    },

    getAllItems: async () => {
        try {
            const items = await Item.findAll();
            console.log("Fetched Items:", items); // Log ekleme
            return items;
        } catch (err) {
            console.error('Error fetching items:', err); // Log ekleme
            throw new Error('no results returned');
        }
    },

    getItemsByCategory: async (category) => {
        try {
            return await Item.findAll({ where: { category } });
        } catch {
            throw new Error('no results returned');
        }
    },

    getItemsByMinDate: async (minDateStr) => {
        const { gte } = Sequelize.Op;
        try {
            return await Item.findAll({
                where: {
                    itemDate: { [gte]: new Date(minDateStr) },
                },
            });
        } catch {
            throw new Error('no results returned');
        }
    },

    getItemById: async (id) => {
        try {
            const items = await Item.findAll({ where: { id } });
            return items[0];
        } catch {
            throw new Error('no results returned');
        }
    },

    addItem: async (itemData) => {
        try {
            itemData.published = itemData.published ? true : false;
            for (let key in itemData) {
                if (itemData[key] === '') itemData[key] = null;
            }
            itemData.itemDate = new Date();
            console.log("Adding Item:", itemData); // Log ekleme
            const newItem = await Item.create(itemData);
            console.log("Item Created:", newItem); // Log ekleme
        } catch (err) {
            console.error("Error adding item:", err); // Log ekleme
            throw new Error('unable to create item');
        }
    },

    getPublishedItems: async () => {
        try {
            return await Item.findAll({ where: { published: true } });
        } catch {
            throw new Error('no results returned');
        }
    },

    getPublishedItemsByCategory: async (category) => {
        try {
            return await Item.findAll({ where: { published: true, category } });
        } catch {
            throw new Error('no results returned');
        }
    },

    getCategories: async () => {
        try {
            const categories = await Category.findAll();
            console.log("Fetched Categories:", categories); // Log ekleme
            return categories;
        } catch (err) {
            console.error("Error fetching categories:", err); // Log ekleme
            throw new Error('no results returned');
        }
    },

    addCategory: async (categoryData) => {
        try {
            for (let key in categoryData) {
                if (categoryData[key] === '') categoryData[key] = null;
            }
            const newCategory = await Category.create(categoryData);
            console.log("Category Created:", newCategory); // Log ekleme
        } catch (err) {
            console.error("Error adding category:", err); // Log ekleme
            throw new Error('unable to create category');
        }
    },

    deleteCategoryById: async (id) => {
        try {
            await Category.destroy({ where: { id } });
        } catch {
            throw new Error('unable to remove category');
        }
    },

    deleteItemById: async (id) => {
        try {
            await Item.destroy({ where: { id } });
        } catch {
            throw new Error('unable to remove item');
        }
    },
};
