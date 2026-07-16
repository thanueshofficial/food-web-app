const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Connection Configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'swiggy_user',
  password: process.env.DB_PASSWORD || 'secure_password',
  database: process.env.DB_NAME || 'food_delivery',
  port: 5432,
});

// Structural Schema Initialization & Seeding Script
const bootstrapDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        cuisine VARCHAR(100),
        rating NUMERIC(2,1),
        delivery_time INT,
        image_emoji VARCHAR(10)
      );
      
      CREATE TABLE IF NOT EXISTS food_items (
        id SERIAL PRIMARY KEY,
        restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        price NUMERIC(6,2) NOT NULL,
        description TEXT,
        is_veg BOOLEAN DEFAULT true,
        rating NUMERIC(2,1) DEFAULT 4.0
      );
    `);

    const checkCount = await pool.query('SELECT COUNT(*) FROM restaurants');
    if (parseInt(checkCount.rows[0].count) === 0) {
      console.log('Seeding fresh mock database values...');
      
      const r1 = await pool.query("INSERT INTO restaurants (name, cuisine, rating, delivery_time, image_emoji) VALUES ('Paradise Biryani', 'Indian, Biryani', 4.5, 30, '🍛') RETURNING id;");
      const r2 = await pool.query("INSERT INTO restaurants (name, cuisine, rating, delivery_time, image_emoji) VALUES ('Pizza Hut', 'Italian, Pizza', 4.2, 20, '🍕') RETURNING id;");
      
      const bId = r1.rows[0].id;
      const pId = r2.rows[0].id;

      await pool.query(`
        INSERT INTO food_items (restaurant_id, name, category, price, description, is_veg, rating) VALUES
        (${bId}, 'Special Chicken Biryani', 'Mains', 350.00, 'Authentic long-grain basmati rice served with spiced chicken.', false, 4.7),
        (${bId}, 'Paneer Tikka Starter', 'Starters', 220.00, 'Clay oven roasted cheese cubes with green peppers.', true, 4.4),
        (${pId}, 'Veggie Feast Pizza', 'Mains', 450.00, 'Loaded with fresh mushrooms, crisp onions, and sweet corn.', true, 4.3);
      `);
      console.log('Seeding complete.');
    }
  } catch (err) {
    console.error('Database connection delay, retrying in 5s...', err.message);
    setTimeout(bootstrapDB, 5000); // Retry boot if DB engine isn't ready yet
  }
};
bootstrapDB();

// API Endpoints
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/restaurants/:id/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_items WHERE restaurant_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Production API operating smoothly on port ${PORT}`));