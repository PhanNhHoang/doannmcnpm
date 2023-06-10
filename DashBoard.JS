// Import các module cần thiết và thiết lập ứng dụng Express
const express = require('express');
const app = express();

// Cấu hình kết nối tới cơ sở dữ liệu MySQL
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
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

// Route handler cho trang dashboard
app.get('/dashboard', (req, res) => {
    // Lấy day income
    const dayIncomeQuery = 'SELECT SUM(quantity * price) AS dayIncome FROM Orders JOIN OrderDetails ON Orders.order_id = OrderDetails.order_id JOIN Products ON OrderDetails.product_id = Products.product_id WHERE Orders.order_date = CURDATE()';
    connection.query(dayIncomeQuery, (error, results) => {
        if (error) {
            console.error('Error fetching day income:', error);
            res.sendStatus(500);
        } else {
            const dayIncome = results[0].dayIncome;

            // Lấy month income
            const monthIncomeQuery = 'SELECT SUM(quantity * price) AS monthIncome FROM Orders JOIN OrderDetails ON Orders.order_id = OrderDetails.order_id JOIN Products ON OrderDetails.product_id = Products.product_id WHERE MONTH(Orders.order_date) = MONTH(CURDATE())';
            connection.query(monthIncomeQuery, (error, results) => {
                if (error) {
                    console.error('Error fetching month income:', error);
                    res.sendStatus(500);
                } else {
                    const monthIncome = results[0].monthIncome;

                    // Lấy year income
                    const yearIncomeQuery = 'SELECT SUM(quantity * price) AS yearIncome FROM Orders JOIN OrderDetails ON Orders.order_id = OrderDetails.order_id JOIN Products ON OrderDetails.product_id = Products.product_id WHERE YEAR(Orders.order_date) = YEAR(CURDATE())';
                    connection.query(yearIncomeQuery, (error, results) => {
                        if (error) {
                            console.error('Error fetching year income:', error);
                            res.sendStatus(500);
                        } else {
                            const yearIncome = results[0].yearIncome;

                            // Lấy dữ liệu cho biểu đồ đường: số lượng người mua hàng mỗi tháng
                            const monthlyBuyersQuery = 'SELECT MONTH(Orders.order_date) AS month, COUNT(DISTINCT Orders.user_id) AS buyers FROM Orders GROUP BY MONTH(Orders.order_date)';
                            connection.query(monthlyBuyersQuery, (error, results) => {
                                if (error) {
                                    console.error('Error fetching monthly buyers:', error);
                                    res.sendStatus(500);
                                } else {
                                    const monthlyBuyers = results;

                                    // Lấy dữ liệu cho biểu đồ cột: doanh thu theo tháng
                                    const monthlyIncomeQuery = 'SELECT MONTH(Orders.order_date) AS month, SUM(quantity * price) AS income FROM Orders JOIN OrderDetails ON Orders.order_id = OrderDetails.order_id JOIN Products ON OrderDetails.product_id = Products.product_id GROUP BY MONTH(Orders.order_date)';
                                    connection.query(monthlyIncomeQuery, (error, results) => {
                                        if (error) {
                                            console.error('Error fetching monthly income:', error);
                                            res.sendStatus(500);
                                        } else {
                                            const monthlyIncome = results;

                                            // Lấy top 5 sản phẩm
                                            const topProductsQuery = 'SELECT Products.product_id, Products.product_name, SUM(OrderDetails.quantity) AS totalQuantity FROM OrderDetails JOIN Products ON OrderDetails.product_id = Products.product_id GROUP BY Products.product_id ORDER BY totalQuantity DESC LIMIT 5';
                                            connection.query(topProductsQuery, (error, results) => {
                                                if (error) {
                                                    console.error('Error fetching top products:', error);
                                                    res.sendStatus(500);
                                                } else {
                                                    const topProducts = results;

                                                    // Chuẩn bị dữ liệu để truyền cho trang dashboard
                                                    const data = {
                                                        dayIncome,
                                                        monthIncome,
                                                        yearIncome,
                                                        monthlyBuyers,
                                                        monthlyIncome,
                                                        topProducts
                                                    };

                                                    // Gửi phản hồi với dữ liệu cho trang dashboard
                                                    res.json(data);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// Khởi động server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
