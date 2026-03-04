document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    // Database giả lập (Nên để chung 1 file JSON nếu thực tế)
    const products = [
        {id:1, name:"Váy Lụa Sapphire", price:2500000, image:"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800", description:"Váy lụa cao cấp, phong cách thanh lịch cho các buổi tiệc sang trọng."},
        {id:2, name:"Áo Sơ Mi Premium", price:1800000, image:"https://images.unsplash.com/photo-1550639524-056b47719371?w=800", description:"Chất liệu cotton mềm mại, thấm hút tốt."},
        {id:5, name:"Suit Xanh Navy", price:2800000, image:"https://images.unsplash.com/photo-1594932224828-b4b05a832fe3?w=800", description:"Bộ suit lịch lãm cho quý ông thượng lưu."}
    ];

    const product = products.find(p => p.id === id);

    if (!product) {
        document.querySelector('.product-layout').innerHTML = "<h2>Sản phẩm không tồn tại</h2>";
        return;
    }

    // Đổ dữ liệu
    document.getElementById("productName").innerText = product.name;
    document.getElementById("productPrice").innerText = product.price.toLocaleString("vi-VN") + "đ";
    document.getElementById("productImage").src = product.image;
    document.getElementById("productDescription").innerText = product.description;

    // Logic số lượng
    let qty = 1;
    const qtyVal = document.getElementById("quantity-val");
    document.getElementById("btn-plus").onclick = () => { qty++; qtyVal.innerText = qty; };
    document.getElementById("btn-minus").onclick = () => { if(qty > 1) qty--; qtyVal.innerText = qty; };

    // Logic chọn size
    const sizeBtns = document.querySelectorAll(".size-btn");
    sizeBtns.forEach(btn => {
        btn.onclick = () => {
            sizeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        }
    });

    // Thêm vào giỏ hàng (Đồng bộ với localStorage của main.js)
    document.getElementById("addToCart").onclick = () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const size = document.querySelector(".size-btn.active").innerText;

        const cartItem = {
            id: product.id,
            title: product.name,
            price: product.price,
            size: size,
            quantity: qty
        };

        const existing = cart.find(item => item.id === product.id && item.size === size);
        if (existing) {
            existing.quantity += qty;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`Đã thêm ${qty} ${product.name} (Size ${size}) vào giỏ hàng!`);
        window.location.reload(); // Cập nhật số lượng trên Header
    };

    // Cập nhật số lượng giỏ hàng trên Header (từ main.js)
    const cartCount = document.getElementById('cart-count');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartCount.textContent = `(${cart.reduce((sum, item) => sum + item.quantity, 0)})`;
});