/* ===================================================
   CART.JS — Ethereal Blue | Logic Giỏ Hàng
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===== NAVBAR (dùng lại từ index) =====
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const mobileActions = document.querySelector('.nav-mobile-actions');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            if (mobileActions) {
                mobileActions.style.display = navMenu.classList.contains('active') ? 'flex' : 'none';
            }
        });
    }

    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 15px 40px rgba(0,51,102,0.15)';
            header.style.background = 'rgba(253, 251, 247, 0.92)';
        } else {
            header.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.1)';
            header.style.background = 'rgba(253, 251, 247, 0.7)';
        }
    });

    // ===== TRẠNG THÁI =====
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let currentStep = 1;
    let discount = 0;
    let shippingFee = 0;
    let appliedCoupon = '';

    const COUPONS = {
        'ETHEREAL10': 10,
        'BLUE20': 20,
        'VIP30': 30,
    };

    // ===== CẬP NHẬT CART COUNT =====
    function updateCartCount() {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        ['cart-count', 'cart-count-mobile'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = `(${total})`;
        });
    }

    // ===== FORMAT TIỀN =====
    function formatPrice(n) {
        return n.toLocaleString('vi-VN') + 'đ';
    }

    function parsePrice(str) {
        return parseInt(str.replace(/[^\d]/g, '')) || 0;
    }

    // ===== TÍNH TỔNG =====
    function calcSubtotal() {
        return cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
    }

    function calcTotal() {
        const sub = calcSubtotal();
        const discountAmount = Math.round(sub * discount / 100);
        return sub - discountAmount + shippingFee;
    }

    function calcDiscountAmount() {
        return Math.round(calcSubtotal() * discount / 100);
    }

    // ===== CẬP NHẬT SỐ LƯỢNG TẠI CHỖ (không re-render toàn bộ) =====
    function updateItemInPlace(idx) {
        const item = cart[idx];
        const itemEl = document.querySelector(`.cart-item[data-idx="${idx}"]`);
        if (!itemEl) return;

        itemEl.querySelector('.qty-num').textContent = item.quantity;
        itemEl.querySelector('.item-total').textContent = formatPrice(parsePrice(item.price) * item.quantity);

        updateCartCount();
        updateSummary();
    }

    // ===== RENDER GIỎ HÀNG =====
    function renderCart() {
        const list = document.getElementById('cart-items-list');
        const emptyEl = document.getElementById('cart-empty');
        const btnCheckout = document.getElementById('btn-to-step2');

        list.innerHTML = '';

        if (cart.length === 0) {
            emptyEl.classList.add('show');
            btnCheckout.disabled = true;
            updateSummary();
            return;
        }

        emptyEl.classList.remove('show');
        btnCheckout.disabled = false;

        cart.forEach((item, idx) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.dataset.idx = idx;

            const imgStyle = item.image
                ? `background-image: url('${item.image}')`
                : `background: rgba(0,86,179,0.1)`;

            itemEl.innerHTML = `
                <div class="item-img" style="${imgStyle}"></div>
                <div class="item-info">
                    <div class="item-name">${item.title}</div>
                    <div class="item-price-unit">${item.price} / sản phẩm</div>
                    <div class="qty-control">
                        <button class="qty-btn btn-minus" data-idx="${idx}">−</button>
                        <span class="qty-num">${item.quantity}</span>
                        <button class="qty-btn btn-plus" data-idx="${idx}">+</button>
                    </div>
                </div>
                <div class="item-total">${formatPrice(parsePrice(item.price) * item.quantity)}</div>
                <button class="btn-remove-item" data-idx="${idx}" title="Xóa sản phẩm">
                    <i class="fas fa-times"></i>
                </button>
            `;

            list.appendChild(itemEl);
        });

        // Events trên items
        list.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = +btn.dataset.idx;
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity--;
                    updateItemInPlace(idx);
                } else {
                    const itemEl = btn.closest('.cart-item');
                    itemEl.style.transition = 'all 0.3s ease';
                    itemEl.style.opacity = '0';
                    itemEl.style.transform = 'translateX(30px)';
                    setTimeout(() => {
                        cart.splice(idx, 1);
                        saveCart();
                        renderCart();
                    }, 280);
                    return;
                }
                saveCart();
            });
        });

        list.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = +btn.dataset.idx;
                cart[idx].quantity++;
                updateItemInPlace(idx);
                saveCart();
            });
        });

        list.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = +btn.dataset.idx;
                const itemEl = btn.closest('.cart-item');
                itemEl.style.animation = 'none';
                itemEl.style.transition = 'all 0.3s ease';
                itemEl.style.opacity = '0';
                itemEl.style.transform = 'translateX(30px)';
                setTimeout(() => {
                    cart.splice(idx, 1);
                    saveCart();
                    renderCart();
                }, 280);
            });
        });

        updateSummary();
    }

    // ===== CẬP NHẬT SUMMARY =====
    function updateSummary() {
        const sub = calcSubtotal();
        const discAmt = calcDiscountAmount();
        const total = calcTotal();

        setEl('subtotal', formatPrice(sub));
        setEl('total-price', formatPrice(total));
        setEl('shipping-fee', shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee));

        const discRow = document.getElementById('discount-row');
        if (discount > 0) {
            discRow.style.display = 'flex';
            setEl('discount-amount', `-${formatPrice(discAmt)}`);
        } else {
            discRow.style.display = 'none';
        }

        const feeEl = document.getElementById('shipping-fee');
        if (feeEl) {
            feeEl.className = shippingFee === 0 ? 'fee-free' : '';
        }
    }

    function setEl(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // ===== XÓA TẤT CẢ =====
    document.getElementById('btn-clear').addEventListener('click', () => {
        if (cart.length === 0) return;
        if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
        cart = [];
        saveCart();
        renderCart();
    });

    // ===== MÃ GIẢM GIÁ =====
    document.getElementById('btn-coupon').addEventListener('click', () => {
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
            msg.textContent = `✓ Áp dụng thành công! Giảm ${discount}%`;
            msg.className = 'coupon-msg success';
            updateSummary();
        } else {
            msg.textContent = 'Mã giảm giá không hợp lệ.';
            msg.className = 'coupon-msg error';
        }
    });

    // ===== MINI SUMMARY (dùng cho step 2, 3) =====
    function renderMiniSummary(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const total = calcTotal();
        const items = cart.map(item => {
            const imgStyle = item.image ? `background-image: url('${item.image}')` : '';
            return `
                <div class="mini-item">
                    <div class="mini-item-img" style="${imgStyle}"></div>
                    <span class="mini-item-name">${item.title} ×${item.quantity}</span>
                    <span class="mini-item-price">${formatPrice(parsePrice(item.price) * item.quantity)}</span>
                </div>
            `;
        }).join('');

        el.innerHTML = `
            <div class="mini-summary-title">Đơn Hàng Của Bạn</div>
            ${items}
            <div class="mini-divider"></div>
            ${discount > 0 ? `
                <div class="summary-row" style="margin-bottom:8px;">
                    <span style="font-size:13px;color:#888">Giảm giá (${discount}%)</span>
                    <span style="font-size:13px;color:#4CAF50;font-weight:600">-${formatPrice(calcDiscountAmount())}</span>
                </div>
            ` : ''}
            ${shippingFee > 0 ? `
                <div class="summary-row" style="margin-bottom:8px;">
                    <span style="font-size:13px;color:#888">Phí vận chuyển</span>
                    <span style="font-size:13px;font-weight:600">${formatPrice(shippingFee)}</span>
                </div>
            ` : ''}
            <div class="mini-total-row">
                <span>Tổng cộng</span>
                <span>${formatPrice(total)}</span>
            </div>
        `;
    }

    // ===== STEP NAVIGATION =====
    function goToStep(n) {
        // Ẩn step hiện tại
        document.getElementById(`step-${currentStep}`).classList.add('hidden');

        // Cập nhật indicator
        const prevInd = document.getElementById(`step-ind-${currentStep}`);
        if (n > currentStep) {
            prevInd.classList.remove('active');
            prevInd.classList.add('done');
        } else {
            prevInd.classList.remove('done', 'active');
            if (currentStep > 1) prevInd.classList.add('active');
        }

        // Cập nhật lines
        for (let i = 1; i <= 3; i++) {
            const lines = document.querySelectorAll('.step-line');
            if (lines[i - 1]) {
                lines[i - 1].classList.toggle('done', i < n);
            }
        }

        currentStep = n;
        const nextStep = document.getElementById(`step-${n}`);
        nextStep.classList.remove('hidden');

        // Set active indicator
        document.querySelectorAll('.step').forEach((s, i) => {
            s.classList.remove('active');
            if (i + 1 === n) s.classList.add('active');
            if (i + 1 < n) { s.classList.remove('active'); s.classList.add('done'); }
            if (i + 1 > n) { s.classList.remove('active', 'done'); }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Render mini summary khi cần
        if (n === 2) renderMiniSummary('mini-summary-2');
        if (n === 3) renderMiniSummary('mini-summary-3');
    }

    // Step 1 → 2
    document.getElementById('btn-to-step2').addEventListener('click', () => {
        if (cart.length === 0) return;
        goToStep(2);
    });

    // Step 2 → 3
    document.getElementById('btn-to-step3').addEventListener('click', () => {
        if (!validateShipping()) return;
        goToStep(3);
    });

    // Step 3 → back 2
    document.getElementById('btn-back-2').addEventListener('click', () => {
        goToStep(2);
    });

    // Step 2 → back 1
    document.getElementById('btn-back-1').addEventListener('click', () => {
        goToStep(1);
    });

    // ===== VALIDATE GIAO HÀNG =====
    function validateShipping() {
        const fields = [
            { id: 'ship-name', label: 'Họ và tên' },
            { id: 'ship-phone', label: 'Số điện thoại' },
            { id: 'ship-email', label: 'Email' },
            { id: 'ship-address', label: 'Địa chỉ' },
        ];

        let valid = true;
        fields.forEach(f => {
            const el = document.getElementById(f.id);
            if (!el.value.trim()) {
                el.classList.add('error');
                el.addEventListener('input', () => el.classList.remove('error'), { once: true });
                valid = false;
            }
        });

        // Validate email format
        const email = document.getElementById('ship-email');
        if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.classList.add('error');
            valid = false;
        }

        if (!valid) {
            showNotif('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error');
        }
        return valid;
    }

    // ===== SHIPPING METHOD =====
    document.querySelectorAll('input[name="shipping"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.method-option').forEach(opt => opt.classList.remove('selected'));
            radio.closest('.method-option').classList.add('selected');

            shippingFee = radio.value === 'express' ? 30000 : 0;
            updateSummary();
            renderMiniSummary('mini-summary-2');
        });
    });

    // ===== PAYMENT METHOD =====
    document.querySelectorAll('.pay-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            opt.querySelector('input').checked = true;

            const method = opt.dataset.method;
            document.getElementById('card-form').classList.toggle('hidden', method !== 'card');
            document.getElementById('momo-form').classList.toggle('hidden', method !== 'momo');
            document.getElementById('cod-form').classList.toggle('hidden', method !== 'cod');
        });
    });

    // ===== CARD INPUT FORMATTING =====
    const cardNumber = document.getElementById('card-number');
    const cardHolder = document.getElementById('card-holder');
    const cardExpiry = document.getElementById('card-expiry');

    cardNumber.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        val = val.match(/.{1,4}/g)?.join(' ') || val;
        e.target.value = val;

        const display = val || '•••• •••• •••• ••••';
        document.getElementById('card-num-display').textContent =
            display.length < 19 ? display + '•'.repeat(19 - display.length).match(/.{1,4}/g)?.join(' ').substring(display.length) : display;

        // Simpler display update
        const digits = val.replace(/\s/g, '');
        let masked = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) masked += ' ';
            masked += digits[i] || '•';
        }
        document.getElementById('card-num-display').textContent = masked;
    });

    cardHolder.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase() || 'TÊN CHỦ THẺ';
        document.getElementById('card-holder-display').textContent = val.substring(0, 22);
    });

    cardExpiry.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
        e.target.value = val;
        document.getElementById('card-expiry-display').textContent = val || 'MM/YY';
    });

    // ===== VALIDATE CARD =====
    function validateCard() {
        const method = document.querySelector('input[name="payment"]:checked')?.value;
        if (method !== 'card') return true;

        let valid = true;
        const num = cardNumber.value.replace(/\s/g, '');
        if (num.length !== 16) { cardNumber.classList.add('error'); valid = false; }
        if (!cardHolder.value.trim()) { cardHolder.classList.add('error'); valid = false; }

        const exp = cardExpiry.value;
        if (!/^\d{2}\/\d{2}$/.test(exp)) { cardExpiry.classList.add('error'); valid = false; }

        const cvv = document.getElementById('card-cvv');
        if (cvv.value.length !== 3) { cvv.classList.add('error'); valid = false; }

        [cardNumber, cardHolder, cardExpiry, cvv].forEach(el => {
            el.addEventListener('input', () => el.classList.remove('error'), { once: true });
        });

        return valid;
    }

    // ===== THANH TOÁN =====
    document.getElementById('btn-pay').addEventListener('click', () => {
        if (!validateCard()) {
            showNotif('Vui lòng kiểm tra thông tin thẻ.', 'error');
            return;
        }

        const btn = document.getElementById('btn-pay');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Đang xử lý...</span>';

        // Giả lập xử lý thanh toán
        setTimeout(() => {
            processOrder();
        }, 2200);
    });

    function processOrder() {
        // Tạo mã đơn hàng
        const orderId = '#ETH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const totalStr = formatPrice(calcTotal());

        document.getElementById('order-id').textContent = orderId;
        document.getElementById('order-date').textContent = dateStr;
        document.getElementById('order-total-confirm').textContent = totalStr;

        // Chuyển sang step 4
        goToStep(4);

        // Xóa giỏ hàng
        cart = [];
        saveCart();

        // Confetti
        spawnConfetti();
    }

    // ===== CONFETTI =====
    function spawnConfetti() {
        const wrap = document.getElementById('confetti-wrap');
        const colors = ['#003366', '#0056b3', '#FFD700', '#4CAF50', '#FF6B6B', '#fff'];

        for (let i = 0; i < 60; i++) {
            setTimeout(() => {
                const piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.style.left = Math.random() * 100 + '%';
                piece.style.background = colors[Math.floor(Math.random() * colors.length)];
                piece.style.width = (Math.random() * 8 + 4) + 'px';
                piece.style.height = (Math.random() * 8 + 4) + 'px';
                piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
                piece.style.animationDelay = '0s';
                piece.style.top = '-10px';
                wrap.appendChild(piece);
                setTimeout(() => piece.remove(), 4000);
            }, i * 40);
        }
    }

    // ===== NOTIFICATION =====
    function showNotif(message, type = 'success') {
        document.querySelectorAll('[data-notif]').forEach(n => n.remove());
        const n = document.createElement('div');
        n.setAttribute('data-notif', '1');
        n.style.cssText = `
            position: fixed; top: 90px; right: 20px;
            background: ${type === 'error' ? '#cc3333' : '#4CAF50'};
            color: white; padding: 14px 22px; border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            z-index: 9999; font-weight: 600; font-size: 14px;
            font-family: 'Poppins', sans-serif;
            animation: notifIn 0.4s ease-out;
        `;
        n.textContent = message;
        document.body.appendChild(n);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes notifIn { from { transform: translateX(300px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes notifOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(300px); opacity: 0; } }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            n.style.animation = 'notifOut 0.4s ease-out forwards';
            setTimeout(() => n.remove(), 400);
        }, 2500);
    }

    // ===== KHỞI TẠO =====
    updateCartCount();
    renderCart();

    // Gợi ý mã demo
    setTimeout(() => {
        if (cart.length > 0) {
            showNotif('💡 Thử mã: ETHEREAL10, BLUE20, VIP30');
        }
    }, 1500);
});