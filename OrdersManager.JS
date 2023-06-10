// Route handler cho trang "OrdersManager"
app.get('/OrdersManager', (req, res) => {
    // Truy vấn danh sách đơn hàng và chi tiết đơn hàng
    const selectQuery = `
        SELECT Orders.*, OrderDetails.quantity, Products.product_name, Products.price
        FROM Orders
        INNER JOIN OrderDetails ON Orders.order_id = OrderDetails.order_id
        INNER JOIN Products ON OrderDetails.product_id = Products.product_id
    `;
    connection.query(selectQuery, (error, results) => {
        if (error) {
            console.error('Lỗi khi truy vấn danh sách đơn hàng:', error);
            return res.status(500).json({ error: 'Lỗi máy chủ' });
        }

        // Tính tổng giá trị đơn hàng
        let totalValue = 0;
        for (const order of results) {
            totalValue += order.quantity * order.price;
        }

        // Hiển thị trang "OrdersManager" với danh sách đơn hàng và tổng giá trị đơn hàng
        res.render('OrdersManager', { orders: results, totalValue });
    });
});
