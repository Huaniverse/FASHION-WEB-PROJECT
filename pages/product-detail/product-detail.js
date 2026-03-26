document.addEventListener('DOMContentLoaded', function () {

    // Lấy ID sản phẩm từ query string (?id=...) 
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    // Tải danh sách sản phẩm từ file JSON
    fetch('/assets/products.json')
        .then(function (res) {
            return res.json();
        })
        .then(function (products) {

            // Tìm sản phẩm khớp với ID
            let product = null;
            for (let i = 0; i < products.length; i++) {
                if (products[i].id === id) {
                    product = products[i];
                    break;
                }
            }

            // Nếu không tìm thấy -> hiển thị lỗi
            if (!product) {
                document.querySelector('.product-layout').innerHTML = "<h2>Sản phẩm không tồn tại</h2>";
                return;
            }

            // Hiển thị tên sản phẩm
            document.getElementById("productName").textContent = product.name;

            // Hiển thị giá
            const status = getProductStatus(product);
            const priceEl = document.getElementById("productPrice");

            if (status.hasSale) {
                priceEl.innerHTML =
                    '<span class="new-price">' + formatPrice(status.discountedPrice) + '</span>' +
                    '<span class="badge badge-sale">-' + product.sale + '%</span>' +
                    '<span class="old-price">' + formatPrice(product.price) + 'đ</span>';
            } else {
                priceEl.innerHTML =
                    '<span class="new-price">' + formatPrice(product.price) + '</span>';
            }

            // Hiển thị ảnh đầu tiên và mô tả sản phẩm
            document.getElementById("productImage").src = product.images[0];
            document.getElementById("productDescription").textContent = product.description;

            // Bộ sưu tập ảnh
            let currentImageIndex = 0;

            const prevBtn = document.getElementById("prevImageBtn");
            const nextBtn = document.getElementById("nextImageBtn");
            const productImgEl = document.getElementById("productImage");
            const thumbnailGallery = document.getElementById("thumbnailGallery");

            // Cập nhật ảnh chính khi chuyển 
            function updateMainImage(index) {
                currentImageIndex = index;

                // Hiệu ứng mờ dần
                productImgEl.style.opacity = '0.5';
                setTimeout(function () {
                    productImgEl.src = product.images[currentImageIndex];
                    productImgEl.style.opacity = '1';
                }, 150);

                // Cập nhật trạng thái active cho thumbnail
                const thumbItems = document.querySelectorAll('.thumbnail-item');
                for (let i = 0; i < thumbItems.length; i++) {
                    if (i === currentImageIndex) {
                        thumbItems[i].classList.add('active');
                    } else {
                        thumbItems[i].classList.remove('active');
                    }
                }
            }

            // Chỉ khởi tạo nếu có nhiều hơn 1 ảnh
            if (product.images && product.images.length > 1) {

                prevBtn.classList.remove("hidden");
                nextBtn.classList.remove("hidden");

                // hiển thị danh sách thumbnail
                let thumbnailHTML = '';
                for (let i = 0; i < product.images.length; i++) {
                    let activeClass = '';
                    if (i === 0) {
                        activeClass = ' active';
                    }
                    thumbnailHTML +=
                        '<div class="thumbnail-item' + activeClass + '" data-index="' + i + '">' +
                        '    <img src="' + product.images[i] + '" alt="' + product.name + ' ' + (i + 1) + '">' +
                        '</div>';
                }
                thumbnailGallery.innerHTML = thumbnailHTML;

                // Xử lý sự kiện click vào thumbnail
                const thumbItems = document.querySelectorAll('.thumbnail-item');
                for (let i = 0; i < thumbItems.length; i++) {
                    thumbItems[i].onclick = function () {
                        const idx = parseInt(this.getAttribute('data-index'));
                        updateMainImage(idx);
                    };
                }

                // Nút chuyển sang ảnh trước
                prevBtn.onclick = function () {
                    const newIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
                    updateMainImage(newIndex);
                };

                // Nút chuyển sang ảnh tiếp theo
                nextBtn.onclick = function () {
                    const newIndex = (currentImageIndex + 1) % product.images.length;
                    updateMainImage(newIndex);
                };
            }

            // Chọn số lượng
            let qty = 1;
            const qtyVal = document.getElementById("quantity-val");

            // Nút tăng số lượng
            document.getElementById("btn-plus").onclick = function () {
                qty++;
                qtyVal.innerText = qty;
            };

            // Nút giảm số lượng
            document.getElementById("btn-minus").onclick = function () {
                if (qty > 1) {
                    qty--;
                }
                qtyVal.innerText = qty;
            };

            // Chọn size
            const sizePicker = document.querySelector(".size-picker");

            if (product.sizes && product.sizes.length > 0) {
                // hiển thị nút chọn size
                let sizeHTML = '';
                for (let i = 0; i < product.sizes.length; i++) {
                    let activeClass = '';
                    if (i === 0) {
                        activeClass = ' active';
                    }
                    sizeHTML += '<button class="size-btn' + activeClass + '">' + product.sizes[i] + '</button>';
                }
                sizePicker.innerHTML = sizeHTML;
            } else {
                sizePicker.innerHTML = '<button class="size-btn active">Free Size</button>';
            }

            // Xử lý sự kiện chọn size
            const sizeBtns = document.querySelectorAll(".size-btn");
            for (let i = 0; i < sizeBtns.length; i++) {
                sizeBtns[i].onclick = function () {
                    // Bỏ active khỏi tất cả
                    for (let j = 0; j < sizeBtns.length; j++) {
                        sizeBtns[j].classList.remove("active");
                    }
                    // Thêm active vào size vừa click
                    this.classList.add("active");
                };
            }

            // Thêm vào giỏ hàng
            document.getElementById("addToCart").onclick = function () {

                // Kiểm tra đăng nhập
                if (!requireLogin('Vui lòng đăng nhập để thêm vào giỏ hàng!', 1500)) {
                    return;
                }

                // Lấy giỏ hàng hiện tại
                const cart = getCart();

                // Lấy size đang được chọn
                const sizeBtn = document.querySelector(".size-btn.active");
                if (!sizeBtn) {
                    alert('Vui lòng chọn size!');
                    return;
                }
                const size = sizeBtn.innerText;

                // Tính giá cuối cùng
                const finalPrice = getProductStatus(product).discountedPrice;

                // Tìm sản phẩm đã tồn tại trong giỏ (dùng vòng for thay vì find)
                let existing = null;
                for (let i = 0; i < cart.length; i++) {
                    if (cart[i].id === product.id && cart[i].size === size) {
                        existing = cart[i];
                        break;
                    }
                }

                if (existing) {
                    // Đã có → tăng số lượng
                    existing.quantity += qty;
                } else {
                    // Chưa có → thêm mới
                    cart.push({
                        id: product.id,
                        title: product.name,
                        price: finalPrice,
                        size: size,
                        quantity: qty,
                        image: product.images[0],
                        availableSizes: product.sizes
                    });
                }

                // thêm vào giỏ hàng
                saveCart(cart);
                updateCartBadge();
                showNotification('Đã thêm ' + product.name + ' vào giỏ hàng!');
            };
        })
        .catch(function (err) {
            console.error('Lỗi khi tải dữ liệu sản phẩm:', err);
            document.querySelector('.product-layout').innerHTML = "<h2>Đã có lỗi xảy ra. Vui lòng thử lại sau.</h2>";
        });

    // Cập nhật số lượng giỏ hàng trên Header khi vào trang
    updateCartBadge();
});
