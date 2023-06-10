const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Tiemtra',
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

// Register user
app.post('/register', (req, res) => {
    const { username, password, confirmpassword } = req.body;

    // Kiểm tra xem người dùng đã bỏ trống trường thông tin nào hay không
    if (!username || !password || !confirmpassword) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Kiểm tra xem password và confirmpassword có trùng nhau hay không
    if (password !== confirmpassword) {
        return res.status(400).json({ error: 'Mật khẩu không khớp' });
    }

    // Kiểm tra xem người dùng đã đồng ý với các điều khoản và điều kiện hay chưa
    const agreed = req.body.agreed;
    if (!agreed) {
        return res.status(400).json({ error: 'Bạn phải đồng ý với các điều khoản và điều kiện' });
    }

    // Kiểm tra xem tên người dùng đã tồn tại trong cơ sở dữ liệu hay chưa
    const checkUserQuery = 'SELECT * FROM Users WHERE username = ?';
    db.query(checkUserQuery, [username], (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
            return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'Tên người dùng đã tồn tại' });
        }

        // Băm mật khẩu sử dụng bcrypt
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error('Lỗi khi băm mật khẩu:', err);
                return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
            }

            // Thêm người dùng mới vào cơ sở dữ liệu
            const insertUserQuery = 'INSERT INTO Users (username, password, role) VALUES (?, ?, ?)';
            db.query(insertUserQuery, [username, hashedPassword, 'customer'], (err, result) => {
                if (err) {
                    console.error('Lỗi khi thêm người dùng vào cơ sở dữ liệu:', err);
                    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
                }

                return res.send('Đăng ký thành công. Bạn có thể đăng nhập vào tài khoản của mình.');
            });
        });
    });
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists
    const sql = 'SELECT * FROM Users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (results.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = results[0];

        // Compare the password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            if (!isMatch) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            // Redirect to appropriate page based on user role
            if (user.role === 'admin') {
                res.redirect('/admin');
                res.send('Đăng nhập thành công. Chào mừng bạn đến trang admin!');
            } else if (user.role === 'customer') {
                res.redirect('/delights');
                res.send('Đăng nhập thành công. Chào mừng bạn đến trang mua hàng!');
            } else {
                res.status(401).json({ error: 'Invalid role' });
            }
        });
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
