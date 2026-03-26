// HTML cho header
const HEADER_HTML =
    '<a href="/index.html" class="logo">DEUX</a>' +
    '<nav id="nav-menu"><ul>' +
    '    <li><a href="/index.html" class="nav-item">Trang chủ</a></li>' +
    '    <li><a href="/index.html#hot-section" class="nav-item">Xu hướng</a></li>' +
    '    <li><a href="/index.html#sale-section" class="nav-item">Khuyến mãi</a></li>' +
    '    <li class="nav-has-dropdown">' +
    '        <a href="/pages/product-list/product-list.html" class="nav-item">' +
    '            Sản phẩm <i class="fas fa-chevron-down nav-chevron"></i>' +
    '        </a>' +
    '        <ul class="nav-dropdown" id="nav-product-dropdown">' +
    '            <li><a href="/pages/product-list/product-list.html">Tất cả sản phẩm</a></li>' +
    '        </ul>' +
    '    </li>' +
    '</ul>' +
    '<div class="nav-mobile-actions" style="display:none;">' +
    '    <a href="/pages/auth/auth.html?mode=login" class="btn btn-primary btn-login"><i class="far fa-user"></i> Đăng nhập</a>' +
    '    <a href="/pages/cart/cart.html" class="btn btn-primary btn-cart">' +
    '        <i class="fas fa-shopping-bag"></i> Giỏ hàng <span id="cart-count-mobile">(0)</span>' +
    '    </a>' +
    '</div></nav>' +
    '<div class="nav-actions">' +
    '    <a href="/pages/auth/auth.html?mode=login" class="btn btn-primary btn-login"><i class="far fa-user"></i> Đăng nhập</a>' +
    '    <a href="/pages/cart/cart.html" class="btn btn-primary btn-cart">' +
    '        <i class="fas fa-shopping-bag"></i> Giỏ hàng <span id="cart-count">(0)</span>' +
    '    </a>' +
    '</div>' +
    '<button class="menu-mobile" id="mobile-toggle"><i class="fas fa-bars"></i></button>';

// HTML cho footer
const FOOTER_HTML =
    '<div class="container footer-grid">' +
    '    <div>' +
    '        <h3 class="logo">DEUX</h3>' +
    '        <p>Thương hiệu thời trang cao cấp mang phong cách hiện đại, tối giản.</p>' +
    '    </div>' +
    '    <div class="footer-contact">' +
    '        <h4>Thông tin liên hệ</h4>' +
    '        <p><i class="fas fa-map-marker-alt"></i> 123 Đường Blue, Quận 1, TP. HCM</p>' +
    '        <p><i class="fas fa-phone"></i> +84 123 456 789</p>' +
    '        <p><i class="fas fa-envelope"></i> contact@deux.com</p>' +
    '    </div>' +
    '</div>' +
    '<div class="footer-bottom">&copy; 2026 DEUX. All rights reserved.</div>';

// chèn header và footer vào trang
function injectComponents() {
    const headerNode = document.querySelector('header');
    const footerNode = document.querySelector('footer');

    if (headerNode) {
        headerNode.innerHTML = HEADER_HTML;
    }
    if (footerNode) {
        footerNode.innerHTML = FOOTER_HTML;
    }

    // Lấy đường dẫn hiện tại
    const currentPath = window.location.pathname;

    // Thiết lập trạng thái active cho nav items
    const navItems = document.querySelectorAll('.nav-item');
    for (let i = 0; i < navItems.length; i++) {
        const link = navItems[i];
        const href = link.getAttribute('href');

        // Xóa active class khỏi tất cả các link
        link.classList.remove('active');

        // Thiết lập trạng thái active cho link hiện tại
        if (currentPath === '/' || currentPath.endsWith('index.html')) {
            if (href === '/index.html' || href === '#') {
                link.classList.add('active');
            }
        }
        // trang danh sách sản phẩm và chi tiết sản phẩm
        else if (currentPath.includes('product-list') || currentPath.includes('product-detail')) {
            if (href.includes('product-list')) {
                link.classList.add('active');
            }
        }
    }

    // hiệu ứng hover cho dropdown
    bindNavDropdownHover();

    // Tải danh mục sản phẩm từ file JSON vào dropdown
    loadCategoryDropdown();

    // Kích hoạt lại sự kiện DOMContentLoaded cho các file JS khác
    window.dispatchEvent(new Event('DOMContentLoaded'));

    // Thông báo đăng xuất và xử lý menu user
    injectLogoutModal();
    setupUserMenu();
}

// hiệu ứng hover cho dropdown
function bindNavDropdownHover() {
    const items = document.querySelectorAll('.nav-has-dropdown');

    items.forEach(function (item) {
        let closeTimer = null;
        // mở dropdown
        const open = function () {
            clearTimeout(closeTimer);
            item.classList.add('open');
        };
        // đóng dropdown
        const close = function () {
            closeTimer = setTimeout(function () {
                item.classList.remove('open');
            }, 120);
        };

        item.addEventListener('mouseenter', open);
        item.addEventListener('mouseleave', close);

        const panel = item.querySelector('.nav-dropdown');
        if (panel) {
            panel.addEventListener('mouseenter', open);
            panel.addEventListener('mouseleave', close);
        }
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav-has-dropdown')) {
            const openDropdowns = document.querySelectorAll('.nav-has-dropdown.open');
            for (let i = 0; i < openDropdowns.length; i++) {
                openDropdowns[i].classList.remove('open');
            }
        }
    });
}

// Tải danh mục sản phẩm từ file JSON vào dropdown
function loadCategoryDropdown() {
    fetch('/assets/products.json')
        .then(function (r) {
            return r.json();
        })
        .then(function (products) {
            const dropdown = document.getElementById('nav-product-dropdown');
            if (!dropdown) {
                return;
            }

            // Lấy danh sách category duy nhất (dùng vòng for thay vì Set + map)
            const cats = [];
            for (let i = 0; i < products.length; i++) {
                const cat = products[i].category;
                if (!cat) {
                    continue; // Bỏ qua nếu không có category
                }
                // Kiểm tra trùng lặp
                let isDuplicate = false;
                for (let j = 0; j < cats.length; j++) {
                    if (cats[j] === cat) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    cats.push(cat);
                }
            }

            const currentParams = new URLSearchParams(window.location.search);
            const activeCat = currentParams.get('category') || '';

            for (let i = 0; i < cats.length; i++) {
                const li = document.createElement('li');
                const a = document.createElement('a');
                const slug = encodeURIComponent(cats[i]);
                a.href = '/pages/product-list/product-list.html?category=' + slug;
                a.textContent = cats[i].charAt(0).toUpperCase() + cats[i].slice(1);
                if (activeCat === cats[i]) {
                    a.classList.add('active');
                }
                li.appendChild(a);
                dropdown.appendChild(li);
            }
        })
        .catch(function () { }); // Không làm vỡ trang nếu fetch lỗi
}

// thông báo đăng xuất
function injectLogoutModal() {
    const LOGOUT_MODAL_HTML =
        '<div id="logout-modal" class="custom-modal">' +
        '    <div class="modal-content">' +
        '        <h3>Xác nhận đăng xuất</h3>' +
        '        <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>' +
        '        <div class="modal-actions">' +
        '            <button id="confirm-logout" class="btn-modal btn-confirm">Đăng xuất</button>' +
        '            <button id="cancel-logout" class="btn-modal btn-cancel">Hủy bỏ</button>' +
        '        </div>' +
        '    </div>' +
        '</div>';
    document.body.insertAdjacentHTML('beforeend', LOGOUT_MODAL_HTML);
}

// Xử lý dropdown người dùng sau khi đăng nhập
function setupUserMenu() {
    // lấy thông tin người dùng
    const session = getSession();
    const loginBtns = document.querySelectorAll('.btn-login');

    if (!session) {
        return; // Chưa đăng nhập không cần xử lý
    }

    // Lấy tên ngắn để hiển thị
    let firstName = '';
    if (session.fullname) {
        const parts = session.fullname.trim().split(/\s+/);
        firstName = parts[parts.length - 1];
    } else {
        firstName = session.email.split('@')[0];
    }

    for (let i = 0; i < loginBtns.length; i++) {
        const btn = loginBtns[i];

        // Tránh bọc button 2 lần
        if (btn.parentElement.classList.contains('user-menu-wrapper')) {
            continue;
        }

        // Tạo thẻ div để bọc button
        const wrapper = document.createElement('div');
        wrapper.className = 'user-menu-wrapper';
        btn.parentNode.insertBefore(wrapper, btn);
        wrapper.appendChild(btn);

        btn.innerHTML = '<i class="far fa-user"></i> ' + firstName + ' <i class="fas fa-chevron-down user-chevron"></i>';
        btn.href = '#';
        btn.title = '';

        // Tạo dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML =
            '<a onclick="alert(\'Giỏ hàng đang được phát triển\')" class="user-dropdown-item">' +
            '    <i class="fas fa-box-open"></i> Đơn hàng' +
            '</a>' +
            '<div class="user-dropdown-divider"></div>' +
            '<button class="user-dropdown-item user-dropdown-logout">' +
            '    <i class="fas fa-sign-out-alt"></i> Đăng xuất' +
            '</button>';
        wrapper.appendChild(dropdown);

        // dropdown khi click
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            this.parentElement.classList.toggle('open');
        });

        // Nút đăng xuất
        const logoutBtn = dropdown.querySelector('.user-dropdown-logout');
        const modal = document.getElementById('logout-modal');
        const confirmBtn = document.getElementById('confirm-logout');
        const cancelBtn = document.getElementById('cancel-logout');

        // Xử lý nút đăng xuất
        (function (currentWrapper) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                modal.classList.add('show');
                currentWrapper.classList.remove('open');
            });
        })(wrapper);

        confirmBtn.onclick = function () {
            localStorage.removeItem('eb_session');
            location.reload();
        };

        cancelBtn.onclick = function () {
            modal.classList.remove('show');
        };

        // Đóng thông báo khi click ra ngoài
        modal.onclick = function (e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        };

        // Đóng dropdown khi click ra ngoài
        (function (currentWrapper) {
            document.addEventListener('click', function (e) {
                if (!currentWrapper.contains(e.target)) {
                    currentWrapper.classList.remove('open');
                }
            });
        })(wrapper);
    }
}

// Gọi hàm chèn components
injectComponents();