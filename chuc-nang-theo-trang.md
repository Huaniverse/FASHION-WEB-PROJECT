# Danh sách chức năng theo trang — DEUX | Fashion Web

Tài liệu liệt kê các chức năng **đã triển khai** trong mã nguồn (HTML/CSS/JavaScript thuần, `localStorage`), **nhóm theo trang** chứa chúng.

---

## 1. Trang chủ (`index.html`)

- Hiển thị banner / hero với tiêu đề và nút **Khám phá ngay** (chuyển tới trang danh sách sản phẩm).
- Tải dữ liệu sản phẩm từ `assets/products.json`.
- Hiển thị hai khối sản phẩm:
  - **Xu hướng mới nhất**: sản phẩm gắn cờ `hot`.
  - **Ưu đãi đặc biệt**: sản phẩm có giảm giá (`sale`).
- Mỗi thẻ sản phẩm: ảnh, tên, giá (giá gốc / giá khuyến mãi), badge SALE hoặc HOT, liên kết tới chi tiết sản phẩm.
- **Thêm vào giỏ** từ thẻ sản phẩm (yêu cầu đăng nhập; gộp dòng nếu cùng sản phẩm và size mặc định; cập nhật badge số lượng giỏ).
- Thông báo toast khi thêm giỏ thành công; phản hồi tạm thời trên nút “Đã thêm”.
- **Scroll spy**: đánh dấu mục menu đang tương ứng khi cuộn qua các section (`#hot-section`, `#sale-section`).
- **Kéo ngang** danh sách sản phẩm (chuột + cảm ứng) trên các vùng `.grid[data-scrollable="true"]`.

---

## 2. Trang tài khoản — Đăng nhập / Đăng ký / Quên mật khẩu (`pages/auth/auth.html`)

- Chuyển màn hình giữa ba form: **Đăng nhập**, **Đăng ký**, **Quên mật khẩu** (class `active`, query `?mode=login|register|forgot`).
- **Đăng ký**: validate họ tên, email, SĐT (VN), mật khẩu (tối thiểu 6 ký tự), xác nhận mật khẩu, địa chỉ; kiểm tra email trùng; lưu vào `localStorage` (`eb_users`); chọn kênh liên hệ (checkbox); sau khi thành công chuyển sang form đăng nhập.
- **Đăng nhập**: kiểm tra email + mật khẩu; lưu phiên (`eb_session`, không lưu mật khẩu); tùy chọn **Ghi nhớ đăng nhập** (`eb_remembered_email`); chuyển hướng theo `returnUrl` nếu có, không thì về trang chủ.
- **Quên mật khẩu** (demo): kiểm tra email đã đăng ký; tạo token tạm và lưu `eb_reset`; hiển thị token trên thông báo (mô phỏng email); vô hiệu hóa form sau khi gửi.
- Tự khởi tạo **tài khoản demo** (`test@gmail.com` / `test1234`) nếu chưa tồn tại.

---

## 3. Trang danh sách sản phẩm (`pages/product-list/product-list.html`)

- Tải toàn bộ sản phẩm từ `assets/products.json`.
- **Breadcrumb** động: “Tất cả sản phẩm”, thêm nhánh khi lọc danh mục hoặc khi tìm kiếm (hiển thị từ khóa); click “Tất cả sản phẩm” để **reset** bộ lọc.
- **Tìm kiếm theo tên** (lọc realtime khi gõ).
- **Sắp xếp**: giá tăng/giảm, theo tên (A–Z).
- **Thanh danh mục (pill)**: nút “Tất cả” + từng `category` từ dữ liệu; click để lọc / bỏ lọc; đồng bộ với query `?category=...` trên URL.
- Đồng bộ trạng thái active với **menu dropdown Sản phẩm** trên header (khi đổi danh mục từ header hoặc từ pill).
- Hiển thị **số lượng kết quả** (tổng hoặc “Tìm thấy n sản phẩm” khi đang lọc).
- Lưới thẻ sản phẩm (dùng chung logic thẻ với trang chủ): xem chi tiết, thêm giỏ (cần đăng nhập).
- Thông báo khi không có sản phẩm phù hợp hoặc lỗi tải JSON.

---

## 4. Trang chi tiết sản phẩm (`pages/product-detail/product-detail.html`)

- Đọc `?id=` từ URL, tải sản phẩm từ `assets/products.json`.
- Hiển thị tên, mô tả, giá (và khuyến mãi nếu có).
- **Gallery**: ảnh chính; nếu có nhiều ảnh — nút trước/sau, thumbnail, đổi ảnh có hiệu ứng mờ nhẹ.
- **Chọn size** (nút; mặc định size đầu hoặc “Free Size” nếu không có danh sách).
- **Tăng/giảm số lượng** mua.
- **Thêm vào giỏ**: bắt buộc đăng nhập; gộp vào dòng đã có cùng `id` + size hoặc thêm dòng mới; lưu giỏ theo user; toast + cập nhật badge giỏ.
- Thông báo khi không tìm thấy sản phẩm hoặc lỗi tải dữ liệu.

---

## 5. Trang giỏ hàng & thanh toán (`pages/cart/cart.html`)

- **Bắt buộc đăng nhập** để vào trang (dùng `requireLogin`).
- Đồng bộ giỏ với `products.json`: cập nhật tên, giá khuyến mãi, ảnh, danh sách size.
- **Bước 1 — Giỏ hàng**: danh sách dòng hàng (ảnh, tên, đơn giá); đổi **size** (gộp dòng nếu trùng sản phẩm + size); **+/−** số lượng; xóa từng dòng; **xóa toàn bộ giỏ** (có modal xác nhận); trạng thái giỏ rỗng; nút tiếp tục khi có hàng.
- **Mã giảm giá**: áp dụng mã cố định (`DEUX10`, `BLUE20`, `VIP30`); hiển thị dòng giảm giá trên tổng kết; gợi ý mã bằng toast.
- **Tổng kết**: tạm tính, phí ship, giảm giá %, tổng thanh toán.
- **Bước 2 — Giao hàng**: form họ tên, SĐT, email, địa chỉ, thành phố; **tự điền** từ `eb_session`; lưu thành phố vào `localStorage` theo email; chọn **chuẩn / hỏa tốc** (phí ship 0 hoặc cố định); validate bắt buộc + định dạng email; mini tóm tắt đơn.
- **Bước 3 — Thanh toán**: chọn **thẻ / MoMo / COD**; hiện form tương ứng; với thẻ: nhập số thẻ (format 4-4-4-4), tên chủ thẻ (in hoa), hạn (MM/YY), CVV; preview thẻ; validate trước khi thanh toán; giả lập xử lý (spinner ~2s).
- **Bước 4 — Xác nhận**: mã đơn giả lập, ngày, tổng tiền; **làm rỗng giỏ** sau khi hoàn tất.
- Thanh **tiến trình 4 bước** (chỉ báo + đường nối); nút quay lại giữa các bước; cuộn mượt khi đổi bước.

---

## 6. Chức năng trên header / footer (mọi trang có `components.js`)

Các trang chèn `header` / `footer` qua `assets/components.js`:

- Logo, menu: Trang chủ, anchor Xu hướng / Khuyến mãi, **Sản phẩm** (dropdown hover: Tất cả + **danh mục động** từ JSON, link có `?category=`).
- Nút **Đăng nhập** hoặc sau khi đăng nhập: hiển thị **tên ngắn**, menu dropdown (mục “Đơn hàng” hiện là placeholder alert), **Đăng xuất** (modal xác nhận, xóa `eb_session`, reload).
- **Giỏ hàng** với số lượng `(n)`; chặn vào giỏ khi chưa đăng nhập (thông báo + chuyển trang auth).
- **Menu mobile**: bật/tắt `nav`, hiện nút đăng nhập + giỏ trên mobile.
- Đánh dấu **active** menu theo đường dẫn (trang chủ / danh sách & chi tiết sản phẩm).
- Footer: giới thiệu ngắn, thông tin liên hệ, bản quyền.

---

## 7. Tiện ích dùng chung (`assets/main.js` — khi load)

- Đọc phiên đăng nhập, **yêu cầu đăng nhập** với chuyển hướng có `returnUrl`.
- Giỏ theo user (`cart:{email}`), cập nhật **badge** số lượng trên header.
- Định dạng giá VNĐ; tính giá sau giảm / trạng thái HOT-SALE cho sản phẩm.
- **Toast** thông báo góc màn hình.

---

*Tạo từ mã nguồn dự án — 28/03/2026.*
