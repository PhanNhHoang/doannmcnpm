// Import các module cần thiết và thiết lập ứng dụng express
const express = require('express');
const app = express();

// Thêm cấu hình và middleware cho ứng dụng express

// Đăng ký middleware để xử lý các dữ liệu POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình kết nối tới cơ sở dữ liệu MySQL
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'TiemTra'
});

// Kết nối tới cơ sở dữ liệu MySQL
connection.connect((error) => {
    if (error) {
        console.error('Error connecting to the database:', error);
    } else {
        console.log('Connected to the database');
    }
});
// Route handler cho trang "delights"
app.get('/delights', (req, res) => {
    if (!req.session.loggedIn) {
        // Kiểm tra xem người dùng đã đăng nhập hay chưa
        // Nếu chưa đăng nhập, điều hướng đến trang LogIn
        return res.redirect('/login');
    }

    // Lấy product ID từ query parameter
    const productId = req.query.productId;

    // Lấy user ID từ session
    const userId = req.session.userId;

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng hay chưa
    const checkQuery = `SELECT * FROM cart_detail WHERE user_id = ${userId} AND product_id = ${productId}`;
    connection.query(checkQuery, (error, results) => {
        if (error) {
            console.error('Error checking product in cart:', error);
            res.sendStatus(500);
        } else {
            if (results.length > 0) {
                // Sản phẩm đã tồn tại trong giỏ hàng
                res.send('Sản phẩm đã có trong giỏ hàng');
            } else {
                // Sản phẩm chưa tồn tại trong giỏ hàng, thêm mới
                const insertQuery = `INSERT INTO cart_detail (user_id, product_id, quantity) VALUES (${userId}, ${productId}, 1)`;
                connection.query(insertQuery, (error, results) => {
                    if (error) {
                        console.error('Error adding product to cart:', error);
                        res.sendStatus(500);
                    } else {
                        res.send('Sản phẩm đã được thêm vào giỏ hàng');
                    }
                });
            }
        }
    });
});

// Route handler cho nút "Cart" trên trang "delights"
app.get('/cart', (req, res) => {
    if (!req.session.loggedIn) {
        // Kiểm tra xem người dùng đã đăng nhập hay chưa
        // Nếu chưa đăng nhập, điều hướng đến trang LogIn
        return res.redirect('/login');
    }

    // Chuyển hướng đến trang "PacketInformation"
    res.redirect('/PacketInformation');
});


// Khởi động server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
