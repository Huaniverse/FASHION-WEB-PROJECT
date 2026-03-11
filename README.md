# 🛒 FASHION WEB PROJECT

Dự án Website Thời trang hoàn thiện sử dụng **HTML, CSS và JavaScript thuần (Vanilla JS)**. Hệ thống tích hợp `localStorage` để quản lý dữ liệu người dùng và giỏ hàng.

---

## 🛠 1. QUY TRÌNH GITHUB (QUAN TRỌNG)

Để đảm bảo tiến độ và tránh xung đột code (**Conflict**), tất cả thành viên bắt buộc tuân thủ quy trình sau:

### Quy trình làm việc

1. **Cập nhật code mới:** Luôn thực hiện trước khi bắt đầu code.

```bash
git checkout main
git pull origin main

```

2. **Tạo nhánh tính năng:** Tên nhánh không dấu, dùng gạch ngang.

```bash
git checkout -b feature/ten-tinh-nang
# Ví dụ: feature/product-list, feature/product-detail

```

3. **Code và Commit:** Sử dụng **Conventional Commits** (xem chi tiết mục bên dưới).
4. **Hợp nhất code (Merge):** Tạo Pull Request (PR) trên GitHub. Nhóm trưởng sẽ review và thực hiện Merge vào nhánh chính.

### Phân loại Commit

| Type         | Ý nghĩa       | Khi nào dùng?                                   |
| ------------ | ------------- | ----------------------------------------------- |
| **feat**     | Feature       | Khi thêm một tính năng mới.                     |
| **fix**      | Bug Fix       | Khi sửa lỗi.                                    |
| **style**    | Styling       | Thay đổi giao diện (CSS), không thay đổi logic. |
| **refactor** | Refactor      | Tối ưu hóa code nhưng không đổi tính năng.      |
| **docs**     | Documentation | Cập nhật README hoặc chú thích.                 |
| **chore**    | Chore         | Thay đổi cấu trúc file, cài đặt môi trường.     |

---

## 📂 2. CẤU TRÚC THƯ MỤC DỰ ÁN

Cấu trúc này được phân chia để **2 người có thể làm độc lập** phần Danh sách sản phẩm và Chi tiết sản phẩm:

```text
/
├── index.html              # Trang chủ (Home)
├── note                    # Ghi chú HTML/CSS dùng chung
├── assets/                 # Tài nguyên dùng chung
│   ├── style.css           # Biến global, reset, layout, utilities
│   ├── main.js             # Xử lý localStorage, helper functions
│   ├── components.js       # Các thành phần dùng chung (Header, Footer,...)
│   ├── products.json       # Dữ liệu sản phẩm mẫu (Mock data)
│   └── images/             # Hình ảnh dùng chung
├── pages/                  # Các trang con của dự án
│   ├── auth/               # [Người 1] Đăng ký / Đăng nhập / Quên mật khẩu
│   │   ├── login.html, register.html, forgot.html
│   │   ├── login.css, register.css
│   │   └── auth.js
│   ├── product-list/       # [Người 2] Trang danh sách sản phẩm
│   │   ├── product-list.html
│   │   ├── product-list.css
│   │   ├── product-list.js
│   │   └── img/
│   ├── product-detail/     # [Người 3] Trang chi tiết sản phẩm
│   │   ├── product-detail.html
│   │   ├── product-detail.css
│   │   └── product-detail.js
│   └── cart/               # [Người 4] Giỏ hàng và Thanh toán
│       ├── cart.html
│       ├── cart.css
│       └── cart.js
└── README.md

```

---

## 🎨 3. QUY ƯỚC ĐỒNG BỘ (CONVENTIONS)

### 🏷️ Quy tắc đặt tên (Naming Conventions)

- **HTML Class:** Sử dụng phương pháp **BEM**.
  - Cấu trúc: `.block__element--modifier`
  - Ví dụ: `.product-card__btn--disabled`

- **CSS Variables:** Sử dụng **kebab-case**.
  - Ví dụ: `--primary-color`, `--font-main`

- **JavaScript:**
  - Biến/Hàm: **camelCase** (`cartItems`, `handleUpdate()`)
  - Hằng số: **UPPER_SNAKE_CASE** (`STORAGE_KEY`)

* **File & Folder:** Sử dụng **kebab-case**, không dấu.

### 🎨 Hệ thống biến CSS (`assets/style.css`)

```css
:root {
  --primary-blue: #0056b3;
  --accent-blue: #003366;
  --white-cream: #fdfbf7;
  --text-dark: #333333;
}
```

### 💾 Quy ước LocalStorage Keys

- `eb_users`: Danh sách tài khoản người dùng đã đăng ký.
- `eb_session`: Thông tin người dùng hiện hành (phiên đăng nhập).
- `cart` / `cart_{userId}`: Danh sách sản phẩm trong giỏ hàng (cho guest hoặc user).
- `eb_remembered_email`: Tùy chọn lưu email khi đăng nhập.

---

## 🚀 4. CÁCH CHẠY DỰ ÁN

1. **Clone** repository về máy cá nhân.
2. Mở thư mục bằng **VS Code**.
3. Sử dụng extension **Live Server** để chạy file `index.html`.

> [!IMPORTANT]
> **Lưu ý:** Dự án chỉ sử dụng HTML/CSS/JS thuần. Không tự ý cài đặt thư viện ngoài (Bootstrap, Tailwind, jQuery...) trừ khi có sự đồng ý của cả nhóm.
