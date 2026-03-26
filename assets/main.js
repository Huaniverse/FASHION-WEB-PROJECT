// Lưu trữ qua localStorage:
//   - "eb_users"             : mảng tài khoản đã đăng ký
//   - "eb_session"           : tài khoản đang đăng nhập (không có mật khẩu)
//   - "eb_remembered_email"  : email được ghi nhớ khi tick "Ghi nhớ đăng nhập"
//   - "eb_reset"             : token reset mật khẩu tạm thời (demo)

/** Lấy session đang đăng nhập */
function getSession() {
    try {
        const data = JSON.parse(localStorage.getItem("eb_session"));
        if (data && typeof data === "object" && !Array.isArray(data) && Object.keys(data).length > 0) {
            return data;
        }
    } catch (e) {
    }
    return null;
}

/** Kiểm tra đăng nhập, tự động chuyển hướng nếu chưa đăng nhập */
function requireLogin(message, delay) {
    const session = getSession();
    if (session) return true;

    if (message) {
        // Đảm bảo hàm showNotification đã được định nghĩa
        showNotification(message, "#e67e22");
    }

    const redirect = function () {
        const returnUrl = encodeURIComponent(
            window.location.pathname + window.location.search,
        );
        window.location.href =
            "/pages/auth/auth.html?mode=login&returnUrl=" + returnUrl;
    };

    if (delay && delay > 0) {
        setTimeout(redirect, delay);
    } else {
        redirect();
    }
    return false;
}

/** Lấy key giỏ hàng duy nhất cho từng user */
function getCartKey() {
    const session = getSession();
    if (!session) return null;
    return "cart:" + session.email;
}

/** Lấy danh sách sản phẩm trong giỏ */
function getCart() {
    const key = getCartKey();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key) || "[]");
}

/** Lưu giỏ hàng */
function saveCart(cart) {
    const key = getCartKey();
    if (key) {
        localStorage.setItem(key, JSON.stringify(cart));
    }
}

/** Cập nhật số lượng hiển thị trên icon giỏ hàng */
function updateCartBadge() {
    const cart = getCart();
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total = total + cart[i].quantity;
    }
    const badges = document.querySelectorAll("#cart-count, #cart-count-mobile");
    for (let i = 0; i < badges.length; i++) {
        badges[i].textContent = "(" + total + ")";
    }
}

/** Định dạng tiền tệ VNĐ */
function formatPrice(price) {
    return price.toLocaleString("vi-VN") + "đ";
}

/** Kiểm tra trạng thái sản phẩm */
function getProductStatus(product) {
    const hasSale = product.sale && Number(product.sale) > 0;
    const isHot = product.hot === true;
    let discountedPrice = product.price;
    if (hasSale) {
        discountedPrice = Math.round(
            product.price * (1 - Number(product.sale) / 100),
        );
    }
    return { hasSale, isHot, discountedPrice };
}

/** Hiển thị thông báo */
function showNotification(message, color = "#4CAF50", duration = 3000) {
    const oldNotifs = document.querySelectorAll("[data-notification]");
    for (let i = 0; i < oldNotifs.length; i++) {
        oldNotifs[i].remove();
    }

    const notification = document.createElement("div");
    notification.setAttribute("data-notification", "true");
    notification.style.cssText =
        "position: fixed; top: 90px; right: 20px;" +
        "background: " +
        color +
        "; color: white;" +
        "padding: 16px 24px; border-radius: 10px;" +
        "box-shadow: 0 8px 25px rgba(0,0,0,0.2);" +
        "z-index: 9999; font-weight: 600;" +
        "animation: slideInNotif 0.5s ease-out;";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(function () {
        notification.style.animation = "slideOutNotif 0.3s ease-in forwards";
        setTimeout(function () {
            notification.remove();
        }, 300);
    }, duration);
}

/** Tạo thẻ sản phẩm */
function createCard(product) {
    const status = getProductStatus(product);
    const hasSale = status.hasSale;
    const isHot = status.isHot;
    const discountedPrice = status.discountedPrice;

    let badgeHTML = "";
    if (hasSale) {
        badgeHTML =
            '<div class="badge badge-sale">SALE ' + product.sale + "%</div>";
    } else if (isHot) {
        badgeHTML = '<div class="badge badge-hot">HOT</div>';
    }

    let priceHTML = "";
    if (hasSale) {
        priceHTML =
            '<p class="card-price">' +
            '<span class="old-price">' +
            formatPrice(product.price) +
            "</span>" +
            '<span class="new-price">' +
            formatPrice(discountedPrice) +
            "</span>" +
            "</p>";
    } else {
        priceHTML =
            '<p class="card-price">' + formatPrice(product.price) + "</p>";
    }

    const productLink =
        "/pages/product-detail/product-detail.html?id=" + product.id;

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = product.id;
    card.innerHTML =
        badgeHTML +
        '<a href="' +
        productLink +
        '" style="display: block; overflow: hidden; text-decoration: none;">' +
        '    <div class="img-placeholder">' +
        '        <img src="' +
        product.images[0] +
        '" alt="' +
        product.name +
        '" loading="lazy"' +
        "             onerror=\"this.src='https://placehold.co/500x500/e0e8f4/0056b3?text=No+Image'\">" +
        "    </div>" +
        "</a>" +
        '<div class="card-content">' +
        '    <a href="' +
        productLink +
        '" style="text-decoration: none; color: inherit;">' +
        '        <h3 class="card-title">' +
        product.name +
        "</h3>" +
        "    </a>" +
        "    " +
        priceHTML +
        '    <button class="btn btn-primary btn-add">' +
        '        <i class="fa-solid fa-bag-shopping"></i> Thêm vào giỏ' +
        "    </button>" +
        "</div>";

    // Sự kiện Thêm vào giỏ
    card.querySelector(".btn-add").addEventListener("click", function (e) {
        e.preventDefault();
        
        if (!requireLogin("⚠️ Vui lòng đăng nhập để thêm vào giỏ hàng!", 1500)) {
            return;
        }

        let finalPrice = product.price;
        if (hasSale) {
            finalPrice = discountedPrice;
        }

        const cart = getCart();

        let size = "S";
        if (product.sizes && product.sizes.length > 0) {
            size = product.sizes[0];
        }

        let existing = null;
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id === product.id && cart[i].size === size) {
                existing = cart[i];
                break;
            }
        }

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                id: product.id,
                title: product.name,
                price: finalPrice,
                quantity: 1,
                image: product.images[0],
                size: size,
                availableSizes: product.sizes,
            });
        }

        saveCart(cart);
        updateCartBadge();
        showNotification("Đã thêm " + product.name + " vào giỏ hàng!");

        const btn = this;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Đã thêm';
        btn.style.background = "#4CAF50";
        setTimeout(function () {
            btn.innerHTML = originalHTML;
            btn.style.background = "";
        }, 2000);
    });

    return card;
}


document.addEventListener("DOMContentLoaded", function () {
    const mobileToggle = document.getElementById("mobile-toggle");
    const navMenu = document.getElementById("nav-menu");
    const mobileActions = document.querySelector(".nav-mobile-actions");
    const header = document.querySelector("header");

    // Chặn click giỏ hàng nếu chưa đăng nhập
    document.addEventListener("click", function(e) {
        const cartBtn = e.target.closest(".btn-cart");
        if (cartBtn) {
            if (!requireLogin("⚠️ Vui lòng đăng nhập để xem giỏ hàng!", 1500)) {
                e.preventDefault();
            }
        }
    });

    // Khởi tạo các trạng thái ban đầu
    updateCartBadge();

    // Menu mobile 
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", function () {
            navMenu.classList.toggle("active");
            if (mobileActions) {
                if (navMenu.classList.contains("active")) {
                    mobileActions.style.display = "flex";
                } else {
                    mobileActions.style.display = "none";
                }
            }
        });
    }


    // JS riêng cho trang chủ
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-item");
    const shopBtn = document.querySelector(".btn-shop");

    const isHomePage =
        window.location.pathname === "/" ||
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "" ||
        window.location.pathname.endsWith("/");

    if (shopBtn) {
        shopBtn.addEventListener("click", function () {
            window.location.href = "/pages/product-list/product-list.html";
        });
    }

    if (isHomePage) {
        // Xử lý active menu theo vị trí cuộn
        window.addEventListener("scroll", function () {
            if (sections.length > 0) {
                let current = "";
                for (let i = 0; i < sections.length; i++) {
                    if (window.pageYOffset >= sections[i].offsetTop - 200) {
                        current = sections[i].getAttribute("id");
                    }
                }
                for (let i = 0; i < navItems.length; i++) {
                    navItems[i].classList.remove("active");
                    const href = navItems[i].getAttribute("href");
                    if (current && href.includes(current)) {
                        navItems[i].classList.add("active");
                    }
                    if (
                        window.pageYOffset < 200 &&
                        (href === "#" || href === "/index.html")
                    ) {
                        navItems[i].classList.add("active");
                    }
                }
            }
        });

        // Tải dữ liệu trang chủ
        fetch("/assets/products.json")
            .then(function (res) { return res.json(); })
            .then(function (products) { renderProducts(products); })
            .catch(function (err) { console.error("Lỗi trang chủ:", err); });
    }

    // Hiển thị sản phẩm cho trang chủ (helper)
    function renderProducts(products) {
        const hotGrid = document.getElementById("hot-grid");
        const saleGrid = document.getElementById("sale-grid");
        if (!hotGrid || !saleGrid) return;

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const status = getProductStatus(product);
            const card = createCard(product);

            if (status.hasSale) {
                saleGrid.appendChild(card);
            } else if (status.isHot) {
                hotGrid.appendChild(card);
            }
        }
        initDrag();
    }

    // Kéo ngang danh sách sản phẩm
    function initDrag() {
        const grids = document.querySelectorAll(
            '.grid[data-scrollable="true"]',
        );
        for (let g = 0; g < grids.length; g++) {
            (function (grid) {
                let isDown = false,
                    startX,
                    scrollLeft;

                // sự kiện chuột
                grid.addEventListener("mousedown", function (e) {
                    isDown = true;
                    grid.classList.add("dragging");
                    startX = e.pageX - grid.offsetLeft;
                    scrollLeft = grid.scrollLeft;
                });

                grid.addEventListener("mouseleave", function () {
                    isDown = false;
                    grid.classList.remove("dragging");
                });

                grid.addEventListener("mouseup", function () {
                    isDown = false;
                    grid.classList.remove("dragging");
                });

                grid.addEventListener("mousemove", function (e) {
                    if (!isDown) return;
                    e.preventDefault();
                    grid.scrollLeft =
                        scrollLeft - (e.pageX - grid.offsetLeft - startX) * 2;
                });

                // sự kiện cảm ứng
                grid.addEventListener("touchstart", function (e) {
                    isDown = true;
                    startX = e.touches[0].pageX - grid.offsetLeft;
                    scrollLeft = grid.scrollLeft;
                });
                grid.addEventListener("touchend", function () {
                    isDown = false;
                });
                grid.addEventListener("touchmove", function (e) {
                    if (!isDown) return;
                    grid.scrollLeft =
                        scrollLeft -
                        (e.touches[0].pageX - grid.offsetLeft - startX) * 2;
                });
            })(grids[g]);
        }
    }
});
