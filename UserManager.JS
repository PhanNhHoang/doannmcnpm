// Route handler cho trang "UsersInformation"
app.get('/UsersInformation', (req, res) => {
    // Truy vấn danh sách người dùng từ bảng "Users"
    const selectQuery = 'SELECT * FROM Users';
    connection.query(selectQuery, (error, results) => {
        if (error) {
            console.error('Lỗi khi truy vấn danh sách người dùng:', error);
            return res.status(500).json({ error: 'Lỗi máy chủ' });
        }

        // Hiển thị trang "UsersInformation" với danh sách người dùng
        res.render('UsersInformation', { users: results });
    });
});

// Route handler cho nút xóa người dùng
app.post('/DeleteUser', (req, res) => {
    // Lấy user_id từ yêu cầu
    const userId = req.body.userId;

    // Xóa người dùng khỏi bảng "Users"
    const deleteQuery = 'DELETE FROM Users WHERE user_id = ?';
    connection.query(deleteQuery, [userId], (error, results) => {
        if (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            return res.status(500).json({ error: 'Lỗi máy chủ' });
        }

        // Điều hướng đến trang "UsersInformation" sau khi xóa thành công
        res.redirect('/UsersInformation');
    });
});
