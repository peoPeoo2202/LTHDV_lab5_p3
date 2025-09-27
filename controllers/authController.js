const User = require('../models/User'); // Model User
const bcrypt = require('bcrypt');

// Hiển thị trang đăng ký
exports.registerForm = (req, res) => {
  res.render('register', { user: req.session.user });
};

// Xử lý đăng ký user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // Kiểm tra username đã tồn tại chưa
    const exist = await User.findOne({ username });
    if (exist) {
      return res.send('Username đã tồn tại!');
    }

    // Mã hóa password
    const hashed = await bcrypt.hash(password, 10);

    // Tạo user mới
    const user = new User({
      username,
      email,
      phone,
      password: hashed
    });

    await user.save();
    res.redirect('/auth/login');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Hiển thị trang login
exports.loginForm = (req, res) => {
  res.render('/login', { user: req.session.user });
};

// Xử lý login
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.send('Username không tồn tại!');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.send('Sai mật khẩu!');
    }

    // Lưu session
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone
    };

    res.redirect('/auth/profile');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Hiển thị profile
exports.profile = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('/profile', { user: req.session.user });
};

// Logout
exports.logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send(err.message);
    res.clearCookie('connect.sid'); // xóa cookie session
    res.redirect('/auth/login');
  });
};
