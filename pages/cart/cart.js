document.addEventListener('DOMContentLoaded', function () {

    // ────────────────────────────────────────────────────────
    // KIỂM TRA ĐĂNG NHẬP
    // ────────────────────────────────────────────────────────
    if (!requireLogin()) {
        return;
    }
    const session = getSession();

    // ────────────────────────────────────────────────────────
    // BIẾN TRẠNG THÁI TOÀN CỤC
    // ────────────────────────────────────────────────────────
    let   cart           = getCart();
    let   currentStep    = 1;      // Bước hiện tại (1-4)
    let   discount       = 0;      // Phần trăm giảm giá (0-100)
    let   shippingFee    = 0;      // Phí vận chuyển
    let   appliedCoupon  = '';     // Mã coupon đã áp dụng

    // Danh sách mã giảm giá hợp lệ
    const COUPONS = {
        'DEUX10': 10,
        'BLUE20': 20,
        'VIP30':  30
    };

    // ────────────────────────────────────────────────────────
    // TÍNH TOÁN GIÁ TRỊ ĐƠN HÀNG
    // ────────────────────────────────────────────────────────

    // Tính tổng tiền hàng (chưa tính giảm giá và phí ship)
    function calcSubtotal() {
        let total = 0;
        for (let i = 0; i < cart.length; i++) {
            total = total + cart[i].price * cart[i].quantity;
        }
        return total;
    }

    // Tính tổng tiền cuối cùng (sau giảm giá + phí ship)
    function calcTotal() {
        const sub = calcSubtotal();
        const discountAmount = Math.round(sub * discount / 100);
        return sub - discountAmount + shippingFee;
    }

    // Tính số tiền được giảm từ coupon
    function calcDiscountAmount() {
        return Math.round(calcSubtotal() * discount / 100);
    }

    // ────────────────────────────────────────────────────────
    // CẬP NHẬT SỐ LƯỢNG SẢN PHẨM TẠI CHỖ (không re-render toàn bộ)
    // Tham số: idx - chỉ số item trong mảng cart
    // ────────────────────────────────────────────────────────
    function updateItemInPlace(idx) {
        const item = cart[idx];
        const itemEl = document.querySelector('.cart-item[data-idx="' + idx + '"]');
        if (!itemEl) {
            return;
        }

        itemEl.querySelector('.qty-num').textContent = item.quantity;
        itemEl.querySelector('.item-total').textContent = formatPrice(item.price * item.quantity);

        updateCartBadge();
        updateSummary();
    }

    // ────────────────────────────────────────────────────────
    // RENDER TOÀN BỘ GIỎ HÀNG
    // ────────────────────────────────────────────────────────
    function renderCart() {
        const list        = document.getElementById('cart-items-list');
        const emptyEl     = document.getElementById('cart-empty');
        const btnCheckout = document.getElementById('btn-to-step2');

        list.innerHTML = '';

        // Nếu giỏ rỗng
        if (cart.length === 0) {
            emptyEl.classList.add('show');
            btnCheckout.disabled = true;
            updateSummary();
            return;
        }

        emptyEl.classList.remove('show');
        btnCheckout.disabled = false;

        // Render từng sản phẩm 
        for (let idx = 0; idx < cart.length; idx++) {
            const item = cart[idx];
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.dataset.idx = idx;

            // Tạo style ảnh
            let imgStyle = 'background: rgba(0,86,179,0.1)';
            if (item.image) {
                imgStyle = "background-image: url('" + item.image + "')";
            }

            // Tạo HTML dropdown chọn size (dùng vòng for thay vì map)
            const sizes = item.availableSizes || ['S', 'M', 'L', 'XL'];
            let sizeOptions = '';
            for (let s = 0; s < sizes.length; s++) {
                let selected = '';
                if (item.size === sizes[s]) {
                    selected = ' selected';
                }
                sizeOptions += '<option value="' + sizes[s] + '"' + selected + '>' + sizes[s] + '</option>';
            }

            itemEl.innerHTML =
                '<div class="item-img" style="' + imgStyle + '"></div>' +
                '<div class="item-info">' +
                '    <div class="item-name">' + item.title + '</div>' +
                '    <div class="item-size-selector" style="margin-bottom: 8px;">' +
                '        <span style="font-size: 13px; color: #666; margin-right: 5px;">Size:</span>' +
                '        <select class="size-select" data-idx="' + idx + '" style="padding: 2px 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 13px; outline: none; cursor: pointer;">' +
                '            ' + sizeOptions +
                '        </select>' +
                '    </div>' +
                '    <div class="item-price-unit">' + formatPrice(item.price) + ' / sản phẩm</div>' +
                '    <div class="qty-control">' +
                '        <button class="qty-btn btn-minus" data-idx="' + idx + '">−</button>' +
                '        <span class="qty-num">' + item.quantity + '</span>' +
                '        <button class="qty-btn btn-plus" data-idx="' + idx + '">+</button>' +
                '    </div>' +
                '</div>' +
                '<div class="item-total">' + formatPrice(item.price * item.quantity) + '</div>' +
                '<button class="btn-remove-item" data-idx="' + idx + '" title="Xóa sản phẩm">' +
                '    <i class="fas fa-times"></i>' +
                '</button>';

            list.appendChild(itemEl);
        }

        // ── Sự kiện thay đổi Size ──
        const sizeSelects = list.querySelectorAll('.size-select');
        for (let i = 0; i < sizeSelects.length; i++) {
            sizeSelects[i].addEventListener('change', function (e) {
                const idx = Number(e.target.dataset.idx);
                const newSize = e.target.value;
                const currentItem = cart[idx];

                // Tìm sản phẩm cùng id + size mới (dùng vòng for thay vì findIndex)
                let existIdx = -1;
                for (let j = 0; j < cart.length; j++) {
                    if (j !== idx && cart[j].id === currentItem.id && cart[j].size === newSize) {
                        existIdx = j;
                        break;
                    }
                }

                if (existIdx !== -1) {
                    // Đã có → gộp số lượng rồi xóa item hiện tại
                    cart[existIdx].quantity += currentItem.quantity;
                    cart.splice(idx, 1);
                } else {
                    // Chưa có → cập nhật size
                    currentItem.size = newSize;
                }

                saveCart(cart);
                updateCartBadge();
                renderCart();
            });
        }

        // ── Nút Giảm số lượng (−) ──
        const minusBtns = list.querySelectorAll('.btn-minus');
        for (let i = 0; i < minusBtns.length; i++) {
            minusBtns[i].addEventListener('click', function () {
                const idx = Number(this.dataset.idx);
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity--;
                    updateItemInPlace(idx);
                } else {
                    // Số lượng = 1 → xóa với hiệu ứng trượt
                    const itemEl = this.closest('.cart-item');
                    itemEl.style.transition = 'all 0.3s ease';
                    itemEl.style.opacity = '0';
                    itemEl.style.transform = 'translateX(30px)';
                    setTimeout(function () {
                        cart.splice(idx, 1);
                        saveCart(cart);
                        updateCartBadge();
                        renderCart();
                    }, 280);
                    return;
                }
                saveCart(cart);
                updateCartBadge();
            });
        }

        // ── Nút Tăng số lượng (+) ──
        const plusBtns = list.querySelectorAll('.btn-plus');
        for (let i = 0; i < plusBtns.length; i++) {
            plusBtns[i].addEventListener('click', function () {
                const idx = Number(this.dataset.idx);
                cart[idx].quantity++;
                updateItemInPlace(idx);
                saveCart(cart);
                updateCartBadge();
            });
        }

        // ── Nút Xóa sản phẩm (×) ──
        const removeBtns = list.querySelectorAll('.btn-remove-item');
        for (let i = 0; i < removeBtns.length; i++) {
            removeBtns[i].addEventListener('click', function () {
                const idx = Number(this.dataset.idx);
                const itemEl = this.closest('.cart-item');
                itemEl.style.animation = 'none';
                itemEl.style.transition = 'all 0.3s ease';
                itemEl.style.opacity = '0';
                itemEl.style.transform = 'translateX(30px)';
                setTimeout(function () {
                    cart.splice(idx, 1);
                    saveCart(cart);
                    updateCartBadge();
                    renderCart();
                }, 280);
            });
        }

        updateSummary();
    }

    // ────────────────────────────────────────────────────────
    // CẬP NHẬT BẢNG TỔNG KẾT ĐƠN HÀNG
    // ────────────────────────────────────────────────────────
    function updateSummary() {
        const sub = calcSubtotal();
        const discAmt = calcDiscountAmount();
        const total = calcTotal();

        setEl('subtotal', formatPrice(sub));
        setEl('total-price', formatPrice(total));

        let feeText = formatPrice(shippingFee);
        if (shippingFee === 0) {
            feeText = 'Miễn phí';
        }
        setEl('shipping-fee', feeText);

        // Hiện/ẩn dòng giảm giá
        const discRow = document.getElementById('discount-row');
        if (discount > 0) {
            discRow.style.display = 'flex';
            setEl('discount-amount', '-' + formatPrice(discAmt));
        } else {
            discRow.style.display = 'none';
        }

        // Đổi màu chữ "Miễn phí"
        const feeEl = document.getElementById('shipping-fee');
        if (feeEl) {
            if (shippingFee === 0) {
                feeEl.className = 'fee-free';
            } else {
                feeEl.className = '';
            }
        }
    }

    // Helper: Set text cho element theo ID
    function setEl(id, text) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text;
        }
    }

    // ────────────────────────────────────────────────────────
    // XÓA TẤT CẢ SẢN PHẨM (có modal xác nhận)
    // ────────────────────────────────────────────────────────
    const clearCartModal = document.getElementById('clear-cart-modal');
    const confirmClearBtn = document.getElementById('confirm-clear');
    const cancelClearBtn = document.getElementById('cancel-clear');

    document.getElementById('btn-clear').addEventListener('click', function () {
        if (cart.length === 0) {
            return;
        }
        clearCartModal.classList.add('show');
    });

    confirmClearBtn.addEventListener('click', function () {
        cart = [];
        saveCart(cart);
        updateCartBadge();
        renderCart();
        clearCartModal.classList.remove('show');
    });

    const closeClearModal = function () {
        clearCartModal.classList.remove('show');
    };
    cancelClearBtn.addEventListener('click', closeClearModal);
    clearCartModal.addEventListener('click', function (e) {
        if (e.target === clearCartModal) {
            closeClearModal();
        }
    });

    // ────────────────────────────────────────────────────────
    // MÃ GIẢM GIÁ (COUPON)
    // ────────────────────────────────────────────────────────
    document.getElementById('btn-coupon').addEventListener('click', function () {
        const code = document.getElementById('coupon-input').value.trim().toUpperCase();
        const msg = document.getElementById('coupon-msg');

        if (!code) {
            msg.textContent = 'Vui lòng nhập mã giảm giá.';
            msg.className = 'coupon-msg error';
            return;
        }

        if (appliedCoupon === code) {
            msg.textContent = 'Mã này đã được áp dụng.';
            msg.className = 'coupon-msg error';
            return;
        }

        if (COUPONS[code]) {
            discount = COUPONS[code];
            appliedCoupon = code;
            msg.textContent = '✓ Áp dụng thành công! Giảm ' + discount + '%';
            msg.className = 'coupon-msg success';
            updateSummary();
        } else {
            msg.textContent = 'Mã giảm giá không hợp lệ.';
            msg.className = 'coupon-msg error';
        }
    });

    // ────────────────────────────────────────────────────────
    // MINI SUMMARY (tóm tắt đơn hàng bước 2 và 3)
    // Tham số: containerId - ID phần tử chứa mini summary
    // ────────────────────────────────────────────────────────
    function renderMiniSummary(containerId) {
        const el = document.getElementById(containerId);
        if (!el) {
            return;
        }

        const total = calcTotal();

        // Render từng sản phẩm dạng mini (dùng vòng for thay vì map)
        let itemsHTML = '';
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            let imgStyle = '';
            if (item.image) {
                imgStyle = "background-image: url('" + item.image + "')";
            }
            let sizeHTML = '';
            if (item.size) {
                sizeHTML = '<span style="font-size: 11px; color: #888;">Size: ' + item.size + '</span>';
            }
            itemsHTML +=
                '<div class="mini-item">' +
                '    <div class="mini-item-img" style="' + imgStyle + '"></div>' +
                '    <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">' +
                '        <span class="mini-item-name">' + item.title + ' ×' + item.quantity + '</span>' +
                '        ' + sizeHTML +
                '    </div>' +
                '    <span class="mini-item-price">' + formatPrice(item.price * item.quantity) + '</span>' +
                '</div>';
        }

        // Chuẩn bị HTML giảm giá (dùng if/else thay vì ternary trong template)
        let discountHTML = '';
        if (discount > 0) {
            discountHTML =
                '<div class="summary-row" style="margin-bottom:8px;">' +
                '    <span style="font-size:13px;color:#888">Giảm giá (' + discount + '%)</span>' +
                '    <span style="font-size:13px;color:#4CAF50;font-weight:600">-' + formatPrice(calcDiscountAmount()) + '</span>' +
                '</div>';
        }

        // Chuẩn bị HTML phí ship
        let shippingHTML = '';
        if (shippingFee > 0) {
            shippingHTML =
                '<div class="summary-row" style="margin-bottom:8px;">' +
                '    <span style="font-size:13px;color:#888">Phí vận chuyển</span>' +
                '    <span style="font-size:13px;font-weight:600">' + formatPrice(shippingFee) + '</span>' +
                '</div>';
        }

        // Lắp ráp toàn bộ HTML
        el.innerHTML =
            '<div class="mini-summary-title">Đơn Hàng Của Bạn</div>' +
            itemsHTML +
            '<div class="mini-divider"></div>' +
            discountHTML +
            shippingHTML +
            '<div class="mini-total-row">' +
            '    <span>Tổng cộng</span>' +
            '    <span>' + formatPrice(total) + '</span>' +
            '</div>';
    }

    // ────────────────────────────────────────────────────────
    // ĐIỀU HƯỚNG CÁC BƯỚC THANH TOÁN (1→4)
    // Tham số: n - số bước muốn chuyển đến
    // ────────────────────────────────────────────────────────
    function goToStep(n) {
        // Ẩn nội dung bước hiện tại
        document.getElementById('step-' + currentStep).classList.add('hidden');

        // Cập nhật step indicator
        const prevInd = document.getElementById('step-ind-' + currentStep);
        if (n > currentStep) {
            prevInd.classList.remove('active');
            prevInd.classList.add('done');
        } else {
            prevInd.classList.remove('done', 'active');
            if (currentStep > 1) {
                prevInd.classList.add('active');
            }
        }

        // Cập nhật đường kẻ nối (step-line)
        for (let i = 1; i <= 3; i++) {
            const lines = document.querySelectorAll('.step-line');
            if (lines[i - 1]) {
                if (i < n) {
                    lines[i - 1].classList.add('done');
                } else {
                    lines[i - 1].classList.remove('done');
                }
            }
        }

        currentStep = n;

        // Hiện nội dung bước mới
        document.getElementById('step-' + n).classList.remove('hidden');

        // Đồng bộ lại tất cả step indicators (dùng vòng for)
        const steps = document.querySelectorAll('.step');
        for (let i = 0; i < steps.length; i++) {
            steps[i].classList.remove('active');
            if (i + 1 === n) {
                steps[i].classList.add('active');
            }
            if (i + 1 < n) {
                steps[i].classList.remove('active');
                steps[i].classList.add('done');
            }
            if (i + 1 > n) {
                steps[i].classList.remove('active', 'done');
            }
        }

        // Cuộn về đầu trang
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Render mini summary ở bước 2 và 3
        if (n === 2) {
            renderMiniSummary('mini-summary-2');
        }
        if (n === 3) {
            renderMiniSummary('mini-summary-3');
        }
    }

    // Bước 1 → 2
    document.getElementById('btn-to-step2').addEventListener('click', function () {
        if (cart.length === 0) {
            return;
        }
        goToStep(2);
    });

    // Bước 2 → 3
    document.getElementById('btn-to-step3').addEventListener('click', function () {
        if (!validateShipping()) {
            return;
        }
        goToStep(3);
    });

    // ────────────────────────────────────────────────────────
    // TỰ ĐỘNG ĐIỀN THÔNG TIN GIAO HÀNG TỪ SESSION
    // ────────────────────────────────────────────────────────
    function prefillShipping() {
        if (!session) {
            return;
        }

        const nameEl    = document.getElementById('ship-name');
        const phoneEl   = document.getElementById('ship-phone');
        const emailEl   = document.getElementById('ship-email');
        const addressEl = document.getElementById('ship-address');
        const cityEl    = document.getElementById('ship-city');

        if (nameEl && session.fullname)   { nameEl.value = session.fullname; }
        if (phoneEl && session.phone)     { phoneEl.value = session.phone; }
        if (emailEl && session.email)     { emailEl.value = session.email; }
        if (addressEl && session.address) { addressEl.value = session.address; }

        if (cityEl) {
            const savedCity = localStorage.getItem('city:' + session.email);
            if (savedCity) {
                cityEl.value = savedCity;
            }
            cityEl.addEventListener('change', function () {
                localStorage.setItem('city:' + session.email, cityEl.value);
            });
        }
    }
    prefillShipping();

    // Nút Quay lại
    document.getElementById('btn-back-2').addEventListener('click', function () {
        goToStep(2);
    });
    document.getElementById('btn-back-1').addEventListener('click', function () {
        goToStep(1);
    });

    // ────────────────────────────────────────────────────────
    // VALIDATE FORM THÔNG TIN GIAO HÀNG
    // ────────────────────────────────────────────────────────
    function validateShipping() {
        const fields = [
            { id: 'ship-name',    label: 'Họ và tên' },
            { id: 'ship-phone',   label: 'Số điện thoại' },
            { id: 'ship-email',   label: 'Email' },
            { id: 'ship-address', label: 'Địa chỉ' }
        ];

        let valid = true;

        // Duyệt qua từng field bắt buộc (dùng vòng for)
        for (let i = 0; i < fields.length; i++) {
            const el = document.getElementById(fields[i].id);
            if (!el.value.trim()) {
                el.classList.add('error');
                el.addEventListener('input', function () {
                    this.classList.remove('error');
                }, { once: true });
                valid = false;
            }
        }

        // Validate email
        const email = document.getElementById('ship-email');
        if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.classList.add('error');
            valid = false;
        }

        if (!valid) {
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc.', '#c0392b');
        }
        return valid;
    }

    // ────────────────────────────────────────────────────────
    // PHƯƠNG THỨC VẬN CHUYỂN
    // ────────────────────────────────────────────────────────
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');
    for (let i = 0; i < shippingRadios.length; i++) {
        shippingRadios[i].addEventListener('change', function () {
            // Xóa class selected khỏi tất cả option
            const allOptions = document.querySelectorAll('.method-option');
            for (let j = 0; j < allOptions.length; j++) {
                allOptions[j].classList.remove('selected');
            }
            this.closest('.method-option').classList.add('selected');

            if (this.value === 'express') {
                shippingFee = 30000;
            } else {
                shippingFee = 0;
            }
            updateSummary();
            renderMiniSummary('mini-summary-2');
        });
    }

    // ────────────────────────────────────────────────────────
    // PHƯƠNG THỨC THANH TOÁN
    // ────────────────────────────────────────────────────────
    const payOptions = document.querySelectorAll('.pay-option');
    for (let i = 0; i < payOptions.length; i++) {
        payOptions[i].addEventListener('click', function () {
            // Bỏ selected khỏi tất cả
            for (let j = 0; j < payOptions.length; j++) {
                payOptions[j].classList.remove('selected');
            }
            this.classList.add('selected');
            this.querySelector('input').checked = true;

            const method = this.dataset.method;
            // Toggle form tương ứng
            if (method !== 'card') {
                document.getElementById('card-form').classList.add('hidden');
            } else {
                document.getElementById('card-form').classList.remove('hidden');
            }
            if (method !== 'momo') {
                document.getElementById('momo-form').classList.add('hidden');
            } else {
                document.getElementById('momo-form').classList.remove('hidden');
            }
            if (method !== 'cod') {
                document.getElementById('cod-form').classList.add('hidden');
            } else {
                document.getElementById('cod-form').classList.remove('hidden');
            }
        });
    }

    // ────────────────────────────────────────────────────────
    // ĐỊNH DẠNG TỰ ĐỘNG CÁC TRƯỜNG THÔNG TIN THẺ
    // ────────────────────────────────────────────────────────
    const cardNumber = document.getElementById('card-number');
    const cardHolder = document.getElementById('card-holder');
    const cardExpiry = document.getElementById('card-expiry');

    // Số thẻ: tự thêm dấu cách mỗi 4 số
    cardNumber.addEventListener('input', function (e) {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        const chunks = val.match(/.{1,4}/g);
        if (chunks) {
            val = chunks.join(' ');
        }
        e.target.value = val;

        // Cập nhật preview số thẻ
        const digits = val.replace(/\s/g, '');
        let masked = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) {
                masked += ' ';
            }
            if (digits[i]) {
                masked += digits[i];
            } else {
                masked += '•';
            }
        }
        document.getElementById('card-num-display').textContent = masked;
    });

    // Tên chủ thẻ: chuyển thành chữ HOA
    cardHolder.addEventListener('input', function (e) {
        let val = e.target.value.toUpperCase();
        if (!val) {
            val = 'TÊN CHỦ THẺ';
        }
        document.getElementById('card-holder-display').textContent = val.substring(0, 22);
    });

    // Ngày hết hạn: tự thêm dấu / (MM/YY)
    cardExpiry.addEventListener('input', function (e) {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 3) {
            val = val.substring(0, 2) + '/' + val.substring(2);
        }
        e.target.value = val;
        if (val) {
            document.getElementById('card-expiry-display').textContent = val;
        } else {
            document.getElementById('card-expiry-display').textContent = 'MM/YY';
        }
    });

    // ────────────────────────────────────────────────────────
    // VALIDATE THÔNG TIN THẺ
    // ────────────────────────────────────────────────────────
    function validateCard() {
        const methodInput = document.querySelector('input[name="payment"]:checked');
        let method = '';
        if (methodInput) {
            method = methodInput.value;
        }
        if (method !== 'card') {
            return true;
        }

        let valid = true;
        const num = cardNumber.value.replace(/\s/g, '');
        const cvv = document.getElementById('card-cvv');

        if (num.length !== 16)           { cardNumber.classList.add('error'); valid = false; }
        if (!cardHolder.value.trim())    { cardHolder.classList.add('error'); valid = false; }
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry.value)) { cardExpiry.classList.add('error'); valid = false; }
        if (cvv.value.length !== 3)      { cvv.classList.add('error'); valid = false; }

        // Xóa class lỗi khi nhập lại (dùng vòng for thay vì forEach)
        const errorFields = [cardNumber, cardHolder, cardExpiry, cvv];
        for (let i = 0; i < errorFields.length; i++) {
            errorFields[i].addEventListener('input', function () {
                this.classList.remove('error');
            }, { once: true });
        }

        return valid;
    }

    // ────────────────────────────────────────────────────────
    // NÚT THANH TOÁN
    // ────────────────────────────────────────────────────────
    document.getElementById('btn-pay').addEventListener('click', function () {
        if (!validateCard()) {
            showNotification('Vui lòng kiểm tra thông tin thẻ.', '#c0392b');
            return;
        }

        const btn = document.getElementById('btn-pay');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Đang xử lý...</span>';

        // Giả lập thời gian xử lý (2.2 giây)
        setTimeout(function () {
            processOrder();
        }, 2200);
    });

    // ────────────────────────────────────────────────────────
    // XỬ LÝ ĐƠN HÀNG SAU KHI THANH TOÁN THÀNH CÔNG
    // ────────────────────────────────────────────────────────
    function processOrder() {
        const orderId = '#ETH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const totalStr = formatPrice(calcTotal());

        document.getElementById('order-id').textContent = orderId;
        document.getElementById('order-date').textContent = dateStr;
        document.getElementById('order-total-confirm').textContent = totalStr;

        goToStep(4);

        cart = [];
        saveCart(cart);
        updateCartBadge();

        spawnConfetti();
    }

    // ────────────────────────────────────────────────────────
    // HIỆU ỨNG CONFETTI (ĐẶT HÀNG THÀNH CÔNG)
    // ────────────────────────────────────────────────────────
    function spawnConfetti() {
        const wrap = document.getElementById('confetti-wrap');
        const colors = ['#003366', '#0056b3', '#FFD700', '#4CAF50', '#FF6B6B', '#fff'];

        // Tạo 60 mảnh confetti (dùng vòng for)
        for (let i = 0; i < 60; i++) {
            (function (index) {
                setTimeout(function () {
                    const piece = document.createElement('div');
                    piece.className = 'confetti-piece';
                    piece.style.left = Math.random() * 100 + '%';
                    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
                    piece.style.width = (Math.random() * 8 + 4) + 'px';
                    piece.style.height = (Math.random() * 8 + 4) + 'px';
                    if (Math.random() > 0.5) {
                        piece.style.borderRadius = '50%';
                    } else {
                        piece.style.borderRadius = '2px';
                    }
                    piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
                    piece.style.animationDelay = '0s';
                    piece.style.top = '-10px';
                    wrap.appendChild(piece);

                    setTimeout(function () {
                        piece.remove();
                    }, 4000);
                }, index * 40);
            })(i);
        }
    }

    // ────────────────────────────────────────────────────────
    // KHỞI TẠO VÀ ĐỒNG BỘ DỮ LIỆU GIỎ HÀNG
    // Tải products.json và cập nhật lại giá/tên/ảnh
    // ────────────────────────────────────────────────────────
    async function initCart() {
        try {
            const res = await fetch('/assets/products.json');
            const products = await res.json();

            if (cart.length > 0) {
                // Cập nhật từng sản phẩm (dùng vòng for thay vì map + find)
                const updatedCart = [];
                for (let i = 0; i < cart.length; i++) {
                    const item = cart[i];

                    // Tìm sản phẩm tương ứng trong JSON (dùng vòng for thay vì find)
                    let product = null;
                    for (let j = 0; j < products.length; j++) {
                        if (products[j].id === item.id) {
                            product = products[j];
                            break;
                        }
                    }

                    if (product) {
                        const status = getProductStatus(product);
                        const finalPriceNum = status.discountedPrice;

                        // Cập nhật thông tin mới nhất (gán thủ công thay vì spread)
                        updatedCart.push({
                            id:             item.id,
                            title:          product.name,
                            price:          finalPriceNum,
                            quantity:       item.quantity,
                            size:           item.size,
                            image:          product.images[0],
                            availableSizes: product.sizes
                        });
                    } else {
                        // Giữ nguyên nếu không tìm thấy
                        updatedCart.push(item);
                    }
                }
                cart = updatedCart;
                saveCart(cart);
                updateCartBadge();
            }
        } catch (err) {
            console.error('Lỗi đồng bộ giỏ hàng:', err);
        }

        updateCartBadge();
        renderCart();
    }

    initCart();

    // Gợi ý mã coupon demo sau 1.5 giây
    setTimeout(function () {
        if (cart.length > 0) {
            showNotification('💡 Thử mã: DEUX10, BLUE20, VIP30', '#4CAF50', 6000);
        }
    }, 1500);
});
