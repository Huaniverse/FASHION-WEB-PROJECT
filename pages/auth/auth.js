/** Lấy danh sách người dùng từ localStorage */
function getUsers() {
    return JSON.parse(localStorage.getItem('eb_users') || '[]');
}

/** Lưu danh sách người dùng vào localStorage */
function saveUsers(users) {
    localStorage.setItem('eb_users', JSON.stringify(users));
}

/** Chuyển đổi giữa các section: login | register | forgot */
function showSection(section) {
    const sections = ['login', 'register', 'forgot'];
    const wrapper = document.getElementById('auth-wrapper');
    if (!wrapper) {
        return;
    }

    // Xóa class "active" khỏi tất cả section
    for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i] + '-section');
        if (el) {
            el.classList.remove('active');
        }
    }

    // Hiển thị section được chọn
    const activeEl = document.getElementById(section + '-section');
    if (activeEl) {
        activeEl.classList.add('active');

        // Thêm class đặc biệt khi đang ở form đăng ký
        if (section === 'register') {
            wrapper.classList.add('register-active');
        } else {
            wrapper.classList.remove('register-active');
        }
    }
}

/** Lưu thông tin phiên đăng nhập */
function setSession(user) {
    // Tạo bản sao user nhưng bỏ password
    const safeUser = {
        id:        user.id,
        fullname:  user.fullname,
        email:     user.email,
        phone:     user.phone,
        address:   user.address,
        contact:   user.contact,
        createdAt: user.createdAt
    };
    localStorage.setItem('eb_session', JSON.stringify(safeUser));
}

/** Khởi tạo tài khoản demo nếu chưa có */
function initDemoAccount() {
    const demoEmail = 'test@gmail.com';
    const users = getUsers();

    // Kiểm tra xem tài khoản demo đã có chưa
    let demoExists = false;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === demoEmail) {
            demoExists = true;
            break;
        }
    }

    // Nếu chưa có -> tạo mới
    if (!demoExists) {
        users.push({
            id:        'demo',
            fullname:  'Demo User',
            email:     demoEmail,
            password:  'test1234',
            phone:     '0987654321',
            address:   'CTU, Can Tho',
            contact:   ['email'],
            createdAt: new Date().toISOString()
        });
        saveUsers(users);
    }
}

/** Đăng xuất và quay về trang chủ */
function logout() {
    localStorage.removeItem('eb_session');
    window.location.href = '/index.html';
}

/** Kiểm tra định dạng email */
function isValidEmail(email) {
    const strictRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return strictRegex.test(email);
}

/** Kiểm tra định dạng số điện thoại VN */
function isValidPhone(phone) {
    return /^(0|\+84)[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}



/** Khởi tạo logic form đăng ký */
function initRegister() {
    const form = document.querySelector('.register-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // chặn reload trang

        // Lấy giá trị từ các input
        const fullname = document.getElementById('reg-fullname').value.trim();
        const email    = document.getElementById('reg-email').value.trim().toLowerCase();
        const phone    = document.getElementById('reg-phone').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm  = document.getElementById('reg-confirm').value;
        const address  = document.getElementById('reg-address').value.trim();

        // Xóa trạng thái lỗi cũ trước khi kiểm tra
        const inputs = form.querySelectorAll('input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].classList.remove('invalid');
        }

        // Kiểm tra từng trường
        if (!fullname) {
            document.getElementById('reg-fullname').classList.add('invalid');
            return showNotification('Vui lòng nhập họ tên.', '#c0392b');
        }
        if (!isValidEmail(email)) {
            document.getElementById('reg-email').classList.add('invalid');
            return showNotification('Email không hợp lệ.', '#c0392b');
        }
        if (!isValidPhone(phone)) {
            document.getElementById('reg-phone').classList.add('invalid');
            return showNotification('Số điện thoại không hợp lệ (VD: 0912345678).', '#c0392b');
        }
        if (password.length < 6) {
            document.getElementById('reg-password').classList.add('invalid');
            return showNotification('Mật khẩu tối thiểu 6 ký tự.', '#c0392b');
        }
        if (password !== confirm) {
            document.getElementById('reg-confirm').classList.add('invalid');
            return showNotification('Mật khẩu xác nhận không khớp.', '#c0392b');
        }
        if (!address) {
            document.getElementById('reg-address').classList.add('invalid');
            return showNotification('Vui lòng nhập địa chỉ.', '#c0392b');
        }

        // Kiểm tra email đã được đăng ký chưa
        const users = getUsers();
        let emailExists = false;
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                emailExists = true;
                break;
            }
        }
        if (emailExists) {
            document.getElementById('reg-email').classList.add('invalid');
            return showNotification('Email này đã được đăng ký.', '#c0392b');
        }

        // Lấy phương thức liên hệ được chọn trong checkbox
        const contactCheckboxes = form.querySelectorAll('input[name="contact"]:checked');
        const contact = [];
        for (let i = 0; i < contactCheckboxes.length; i++) {
            contact.push(contactCheckboxes[i].value);
        }

        // Tạo user mới và lưu vào localStorage
        const newUser = {
            id:        Date.now(),
            fullname:  fullname,
            email:     email,
            phone:     phone,
            password:  password,
            address:   address,
            contact:   contact,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        saveUsers(users);

        // Thông báo thành công và chuyển sang form đăng nhập
        showNotification('🎉 Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(function () {
            if (typeof showSection === 'function') {
                showSection('login');
                showNotification('✅ Đăng ký thành công! Hãy đăng nhập.');
            } else {
                window.location.href = 'auth.html?mode=login&registered=1';
            }
        }, 1500);
    });
}

/** Khởi tạo logic form đăng nhập */
function initLogin() {
    const form = document.querySelector('.login-form');
    if (!form) return;

    // Hiển thị thông báo nếu vừa đăng ký xong
    if (new URLSearchParams(location.search).get('registered')) {
        showNotification('✅ Đăng ký thành công! Hãy đăng nhập.');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Ngăn form submit reload trang

        // Lấy giá trị nhập vào
        const email    = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const checkbox = form.querySelector('input[type="checkbox"]');
        let remember = false;
        if (checkbox) {
            remember = checkbox.checked;
        }

        // Xóa lỗi cũ
        const inputs = form.querySelectorAll('input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].classList.remove('invalid');
        }

        // Kiểm tra email
        if (!isValidEmail(email)) {
            document.getElementById('login-email').classList.add('invalid');
            return showNotification('Email không hợp lệ.', '#c0392b');
        }

        // Kiểm tra mật khẩu
        if (!password) {
            document.getElementById('login-password').classList.add('invalid');
            return showNotification('Vui lòng nhập mật khẩu.', '#c0392b');
        }

        // Kiểm tra thông tin tài khoản
        const users = getUsers();
        let user = null;
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email && users[i].password === password) {
                user = users[i];
                break;
            }
        }

        if (!user) {
            document.getElementById('login-email').classList.add('invalid');
            document.getElementById('login-password').classList.add('invalid');
            return showNotification('Email hoặc mật khẩu không đúng.', '#c0392b');
        }

        // Đăng nhập thành công -> lưu session
        setSession(user);

        if (remember) {
            localStorage.setItem('eb_remembered_email', email);
        } else {
            localStorage.removeItem('eb_remembered_email');
        }

        showNotification('✅ Chào mừng trở lại, ' + (user.fullname || user.email) + '!');

        // Chuyển hướng về URL trước đó
        setTimeout(function () {
            const params = new URLSearchParams(location.search);
            const returnUrl = params.get('returnUrl');
            let finalUrl = '/index.html';
            if (returnUrl) {
                finalUrl = decodeURIComponent(returnUrl);
            }
            window.location.href = finalUrl;
        }, 1200);
    });

    // Tự động điền email đã ghi nhớ vào input
    const remembered = localStorage.getItem('eb_remembered_email');
    if (remembered) {
        const emailInput = document.getElementById('login-email');
        if (emailInput) {
            emailInput.value = remembered;
            const cb = form.querySelector('input[type="checkbox"]');
            if (cb) {
                cb.checked = true;
            }
        }
    }
}

/** Khởi tạo logic form quên mật khẩu */
function initForgot() {
    const form = document.querySelector('.simple-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Ngăn form submit reload trang


        const email = document.getElementById('reset-email').value.trim().toLowerCase();
        const input = document.getElementById('reset-email');

        input.classList.remove('invalid');

        // Kiểm tra email
        if (!isValidEmail(email)) {
            input.classList.add('invalid');
            return showNotification('Email không hợp lệ.', '#c0392b');
        }

        // Kiểm tra email tồn tại trong hệ thống chưa
        const users = getUsers();
        let user = null;
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                user = users[i];
                break;
            }
        }

        if (!user) {
            input.classList.add('invalid');
            return showNotification('Email này chưa được đăng ký trong hệ thống.', '#c0392b');
        }

        // Tạo token reset mật khẩu (DEMO)
        const resetToken = Math.random().toString(36).slice(2, 10).toUpperCase();
        localStorage.setItem('eb_reset', JSON.stringify({
            email:  email,
            token:  resetToken,
            expiry: Date.now() + 15 * 60 * 1000
        }));

        showNotification(
            '📧 Đã ghi nhận! (Demo) Token đặt lại: ' + resetToken + ' — Trong thực tế sẽ gửi qua email.',
            '#1a6ea8'
        );

        // Vô hiệu hóa form sau khi đã gửi yêu cầu
        form.style.opacity = '0.4';
        form.style.pointerEvents = 'none';
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode) {
        const validModes = ['login', 'register', 'forgot'];
        let isValid = false;
        for (let i = 0; i < validModes.length; i++) {
            if (validModes[i] === mode) {
                isValid = true;
                break;
            }
        }
        if (isValid) {
            showSection(mode);
        }
    }

    initDemoAccount();
    initRegister();
    initLogin();
    initForgot();
});
