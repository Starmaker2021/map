const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path'); // 引入path模块处理路径
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();

app.use(cors());
app.use(express.json());

// 新增托管静态文件的代码
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '727399st', // 建议使用环境变量来管理密码等敏感信息
    database: 'map'
});

    db.connect(err => {
        if (err) {
            console.error('Error connecting to MySQL', err);
            return;
        }
        console.log('MySQL connected...');
    });

    app.get('/api/purchases', (req, res) => {
        const sql = 'SELECT * FROM customer';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching data', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        });
    });

    // 只处理来自前端的请求，不再调用 Nominatim
    app.post('/api/purchases', async (req, res) => {
        const { customer, city, date, latitude, longitude, gender, age, face, time, reason } = req.body;

        try {
            const sql = 'INSERT INTO customer SET ?';
            db.query(sql, { customer, city, date, latitude, longitude, gender, age, face, time, reason }, (err, result) => {
                if (err) {
                    console.error('Error inserting data', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.json({
                    message: 'Purchase added successfully',
                    id: result.insertId,
                    customer: customer,
                    city: city,
                    date: date,
                    latitude: latitude, // 这里使用的是请求体中的 latitude
                    longitude: longitude, // 这里使用的是请求体中的 longitude
                    gender:gender,
                    age:age,
                    face:face,
                    time:time,
                    reason:reason
                });
                
            });
        } catch (error) {
            console.error('Error during database operation', error);
            res.status(500).json({ error: 'Failed to process request' });
        }
    });

    app.delete('/api/purchases/:id', (req, res) => {
        const { id } = req.params;
        const sql = 'DELETE FROM customer WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Error deleting data', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Purchase deleted successfully' });
        });
    });


// 新增一个路由来捕获并返回index.html，适用于支持前端路由的SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
