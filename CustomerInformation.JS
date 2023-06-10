// Route handler cho trang "CustomerInformation"
app.post('/CustomerInformation', (req, res) => {
    // Lấy thông tin khách hàng từ yêu cầu
    const { fullName, phoneNumber, email, address, district, province, notes } = req.body;

    // Kiểm tra xem các trường bắt buộc đã được nhập đầy đủ hay chưa
    if (!fullName || !phoneNumber || !email || !address || !district || !province) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin bắt buộc' });
    }

    // Lấy ngày hôm nay
    const orderDate = new Date();

    // Lưu thông tin khách hàng vào bảng "orders" trong cơ sở dữ liệu
    const insertQuery = 'INSERT INTO orders (full_name, phone_number, email, address, district, province, notes, order_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(insertQuery, [fullName, phoneNumber, email, address, district, province, notes, orderDate], (error, results) => {
        if (error) {
            console.error('Lỗi khi lưu thông tin khách hàng:', error);
            return res.status(500).json({ error: 'Lỗi máy chủ' });
        }

        // Điều hướng đến trang xác nhận thanh toán hoặc trang thành công
        res.redirect('/PaymentConfirmation');
    });
});
