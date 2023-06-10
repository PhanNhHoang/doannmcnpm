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

// Route handler cho trang "PacketInformation"
app.get('/PacketInformation', (req, res) => {
    // Lấy user ID từ session (giả sử bạn đã lưu user ID vào session)
    const userId = req.session.userId;


    // Tăng số lượng sản phẩm trong Cart_detail
    app.post('/increaseQuantity', (req, res) => {
        const { user_id, product_id } = req.body;

        // Kiểm tra sản phẩm có tồn tại trong Cart_detail của user không
        const checkSql = 'SELECT * FROM Cart_detail WHERE user_id = ? AND product_id = ?';
        db.query(checkSql, [user_id, product_id], (err, results) => {
            if (err) {
                console.error('Error querying database:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            if (results.length === 0) {
                res.status(404).json({ error: 'Product not found in cart' });
                return;
            }

            const cartItem = results[0];
            const newQuantity = cartItem.quantity + 1;

            // Cập nhật số lượng sản phẩm trong Cart_detail
            const updateSql = 'UPDATE Cart_detail SET quantity = ? WHERE user_id = ? AND product_id = ?';
            db.query(updateSql, [newQuantity, user_id, product_id], (err, result) => {
                if (err) {
                    console.error('Error updating quantity in Cart_detail:', err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                res.status(200).json({ success: 'Quantity increased successfully' });
            });
        });
    });

    // Giảm số lượng sản phẩm trong Cart_detail
    app.post('/decreaseQuantity', (req, res) => {
        const { user_id, product_id } = req.body;

        // Kiểm tra sản phẩm có tồn tại trong Cart_detail của user không
        const checkSql = 'SELECT * FROM Cart_detail WHERE user_id = ? AND product_id = ?';
        db.query(checkSql, [user_id, product_id], (err, results) => {
            if (err) {
                console.error('Error querying database:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            if (results.length === 0) {
                res.status(404).json({ error: 'Product not found in cart' });
                return;
            }

            const cartItem = results[0];
            const newQuantity = cartItem.quantity - 1;

            // Cập nhật số lượng sản phẩm trong Cart_detail
            const updateSql = 'UPDATE Cart_detail SET quantity = ? WHERE user_id = ? AND product_id = ?';
            db.query(updateSql, [newQuantity, user_id, product_id], (err, result) => {
                if (err) {
                    console.error('Error updating quantity in Cart_detail:', err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                res.status(200).json({ success: 'Quantity decreased successfully' });
            });
        });
    });
    // Truy vấn dữ liệu từ bảng cart_detail dựa trên user ID
    const selectQuery = `
        SELECT 
        cart_detail.product_id, 
        products.product_name, 
        cart_detail.quantity, 
        products.price, 
        cart_detail.quantity * products.price AS total_price
        FROM 
        cart_detail
        INNER JOIN 
        products ON cart_detail.product_id = products.product_id
        WHERE 
        cart_detail.user_id = ${userId}
        `;

    // Truy vấn để tính tổng giá trị đơn hàng
    const sumQuery = `
        SELECT 
        SUM(cart_detail.quantity * products.price) AS total_order_value
        FROM 
        cart_detail
        INNER JOIN 
        products ON cart_detail.product_id = products.product_id
        WHERE 
        cart_detail.user_id = ${userId}
        `;

    // Thực hiện truy vấn để lấy thông tin cart_detail
    connection.query(selectQuery, (error, results) => {
        if (error) {
            console.error('Error retrieving cart details:', error);
            res.sendStatus(500);
        } else {
            // Lấy kết quả từ truy vấn
            const cartDetails = results;

            // Thực hiện truy vấn để lấy tổng giá trị đơn hàng
            connection.query(sumQuery, (error, results) => {
                if (error) {
                    console.error('Error retrieving total order value:', error);
                    res.sendStatus(500);
                } else {
                    // Lấy tổng giá trị đơn hàng từ kết quả truy vấn
                    const totalOrderValue = results[0].total_order_value;

                    // Gửi kết quả về cho client
                    res.json({ cartDetails, totalOrderValue });
                }
            });
        }
        // Xử lý khi bấm vào nút xác nhận đơn hàng
        app.post('/confirmOrder', (req, res) => {
            // Thực hiện các xử lý cần thiết để xác nhận đơn hàng

            //Lấy thông tin cart Detail dựa trên Order_id
            const selectQuery = 'SELECT * FROM cart_detail WHERE user_id = ?';
            db.query(selectQuery, [user_id], (err, cartItems) => {
                if (err) {
                    console.error('Error retrieving cart items:', err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                // Duyệt qua từng phần tử trong cartItems và thực hiện lưu vào order_detail
                cartItems.forEach((cartItem) => {
                    const { user_id, product_id, quantity } = cartItem;

                    // Thực hiện câu truy vấn để lưu vào `order_detail`
                    const insertQuery = 'INSERT INTO order_detail (user_id, product_id, quantity) VALUES (?, ?, ?)';
                    db.query(insertQuery, [user_id, product_id, quantity], (err, result) => {
                        if (err) {
                            console.error('Error adding item to order detail:', err);
                            res.status(500).json({ error: 'Internal server error' });
                            return;
                        }

                        // Xóa sản phẩm đã được lưu vào `order_detail` khỏi `cart_detail`
                        const deleteQuery = 'DELETE FROM cart_detail WHERE user_id = ? AND product_id = ?';
                        db.query(deleteQuery, [user_id, product_id], (err, result) => {
                            if (err) {
                                console.error('Error deleting item from cart detail:', err);
                                res.status(500).json({ error: 'Internal server error' });
                                return;
                            }
                        });
                    });
                });
            });

            // Sau khi xử lý xong bấm nút, điều hướng đến trang "CustomerInformation"
            res.redirect('/CustomerInformation');
        });

    });

});

// Khởi động server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
