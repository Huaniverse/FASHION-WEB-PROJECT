// Ánh xạ danh mục và icon FontAwesome tương ứng
const CAT_ICONS = {
    váy: "fa-solid fa-vest",
    áo: "fa-solid fa-shirt",
    quần: "fa-solid fa-person-pants",
    "áo khoác": "fa-solid fa-mitten",
    suit: "fa-solid fa-user-tie",
    giày: "fa-solid fa-shoe-prints",
    "phụ kiện": "fa-solid fa-glasses",
};

let allProducts = [];
let category = "";
let search = "";
let sortBy = "";
let grid = document.getElementById("productGrid");
let count = document.getElementById("plResultCount");
let searchEl = document.getElementById("plSearch");
let sortEl = document.getElementById("plSort");

// Tạo các nút lọc danh mục
function makePill(label, iconClass, isActive) {
    const btn = document.createElement("button");
    let activeClass = "";
    if (isActive) {
        activeClass = " pl-cat-pill-active";
    }
    btn.className = "pl-cat-pill" + activeClass;
    if (label === "Tất cả") {
        btn.dataset.cat = "";
    } else {
        btn.dataset.cat = label;
    }
    btn.innerHTML =
        '<i class="' +
        iconClass +
        '"></i>' +
        label.charAt(0).toUpperCase() +
        label.slice(1);
    return btn;
}

// Đồng bộ trạng thái active trong nav dropdown
function syncNavDropdown() {
    const dropdown = document.getElementById("nav-product-dropdown");
    if (!dropdown) {
        return;
    }
    const links = dropdown.querySelectorAll("a");
    for (let i = 0; i < links.length; i++) {
        const href = links[i].getAttribute("href") || "";
        const catParam =
            new URL(href, window.location.origin).searchParams.get(
                "category",
            ) || "";
        if (catParam === category) {
            links[i].classList.add("active");
        } else {
            links[i].classList.remove("active");
        }
    }
}

// Đồng bộ trạng thái active của các nút lọc
function syncCategoryUI() {
    const pills = document.querySelectorAll(".pl-cat-pill");
    for (let i = 0; i < pills.length; i++) {
        const isAll = pills[i].dataset.cat === "" && category === "";
        const isCat = pills[i].dataset.cat === category && category !== "";
        if (isAll || isCat) {
            pills[i].classList.add("pl-cat-pill-active");
        } else {
            pills[i].classList.remove("pl-cat-pill-active");
        }
    }
    syncNavDropdown();
}

// Cập nhật điều hướng phụ
function updateBreadcrumb() {
    const bc = document.getElementById("plBreadcrumb");
    if (!bc) {
        return;
    }

    let html =
        '<span class="pl-breadcrumb-item pl-breadcrumb-item-home" id="plBreadcrumbHome">' +
        '    <i class="fa-solid fa-house"></i> Tất cả sản phẩm' +
        "</span>";

    if (category) {
        // Tự động viết hoa chữ cái đầu cho danh mục
        let label = category.charAt(0).toUpperCase() + category.slice(1);
        html +=
            '<span class="pl-breadcrumb-sep"><i class="fa-solid fa-chevron-right"></i></span>' +
            '<span class="pl-breadcrumb-item pl-breadcrumb-item-active">' +
            label +
            "</span>";
    }

    if (search) {
        html +=
            '<span class="pl-breadcrumb-sep"><i class="fa-solid fa-chevron-right"></i></span>' +
            '<span class="pl-breadcrumb-item pl-breadcrumb-item-active">Kết quả: "' +
            search +
            '"</span>';
    }

    bc.innerHTML = html;

    const homeBtn = document.getElementById("plBreadcrumbHome");
    if (homeBtn) {
        homeBtn.addEventListener("click", resetFilter);
    }
}

// Render thanh lọc danh mục
function renderCategoryBar() {
    const bar = document.getElementById("plCatBar");
    if (!bar) {
        return;
    }

    // Lấy danh sách các danh mục
    const cats = [];
    for (let i = 0; i < allProducts.length; i++) {
        const cat = allProducts[i].category;
        if (!cat) continue;
        let isDup = false;
        for (let j = 0; j < cats.length; j++) {
            if (cats[j] === cat) {
                isDup = true;
                break;
            }
        }
        if (!isDup) cats.push(cat);
    }

    // Tạo thanh lọc danh mục
    const inner = document.createElement("div");
    inner.className = "pl-cat-bar-inner";

    // Tạo nút "Tất cả"
    const allPill = makePill(
        "Tất cả",
        "fa-solid fa-border-all",
        category === "",
    );
    allPill.addEventListener("click", function () {
        category = "";
        syncCategoryUI();
        updateBreadcrumb();
        history.replaceState({}, "", window.location.pathname);
        renderList();
    });
    inner.appendChild(allPill);

    // Tạo thanh chia
    const div = document.createElement("span");
    div.className = "pl-cat-divider";
    inner.appendChild(div);

    // Tạo các nút lọc danh mục
    for (let i = 0; i < cats.length; i++) {
        (function (cat) {
            // Lấy icon tương ứng với danh mục
            const iconClass = CAT_ICONS[cat.toLowerCase()] || "fa-solid fa-tag";
            const isActive = category === cat;
            const pill = makePill(cat, iconClass, isActive);

            // Xử lý sự kiện click vào nút lọc danh mục
            pill.addEventListener("click", function () {
                if (category === cat) {
                    category = "";
                } else {
                    category = cat;
                }
                syncCategoryUI();
                updateBreadcrumb();

                const params = new URLSearchParams();
                if (category) params.set("category", category);
                const qs = params.toString();
                let url = window.location.pathname;
                if (qs) url = "?" + qs;
                history.replaceState({}, "", url);

                renderList();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
            inner.appendChild(pill);
        })(cats[i]);
    }

    bar.innerHTML = "";
    bar.appendChild(inner);
    syncNavDropdown();
}

// Hàm hiển thị danh sách sản phẩm chính
function renderList() {
    let list = allProducts.slice();

    if (search) {
        const kw = search.toLowerCase();
        const filtered = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].name.toLowerCase().includes(kw)) {
                filtered.push(list[i]);
            }
        }
        list = filtered;
    } else if (category) {
        const filtered = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].category === category) {
                filtered.push(list[i]);
            }
        }
        list = filtered;
    }

    const getEffPrice = function (p) {
        return getProductStatus(p).discountedPrice;
    };

    // Sắp xếp danh sách sản phẩm
    if (sortBy === "asc") {
        list.sort(function (a, b) {
            return getEffPrice(a) - getEffPrice(b);
        });
    } else if (sortBy === "desc") {
        list.sort(function (a, b) {
            return getEffPrice(b) - getEffPrice(a);
        });
    } else if (sortBy === "name") {
        list.sort(function (a, b) {
            return a.name.localeCompare(b.name, "vi");
        });
    }

    grid.innerHTML = "";
    if (list.length === 0) {
        grid.innerHTML =
            '<div class="pl-empty"><i class="fa-solid fa-box-open"></i><p>Không tìm thấy sản phẩm phù hợp</p></div>';
    } else {
        for (let i = 0; i < list.length; i++) {
            grid.appendChild(createCard(list[i]));
        }
    }

    if (count) {
        const isFiltered = search || category;
        if (isFiltered && list.length < allProducts.length) {
            count.textContent = "Tìm thấy " + list.length + " sản phẩm";
        } else {
            count.textContent = allProducts.length + " sản phẩm";
        }
    }
}

// Đưa tất cả bộ lọc về mặc định
function resetFilter() {
    category = "";
    search = "";
    if (searchEl) searchEl.value = "";
    history.replaceState({}, "", window.location.pathname);
    syncCategoryUI();
    updateBreadcrumb();
    renderList();
}

// Lấy tham số lọc từ URL
function readURLParams() {
    const params = new URLSearchParams(window.location.search);
    category = params.get("category") || "";
}

// Lắng nghe sự kiện từ thanh Navigation của Header
function bindNavEvents() {
    const navDropdown = document.getElementById("nav-product-dropdown");
    if (navDropdown) {
        const links = navDropdown.querySelectorAll("a");
        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener("click", function (e) {
                const urlObj = new URL(this.href, window.location.origin);
                const catParam = urlObj.searchParams.get("category") || "";

                // Nếu đang ở trang product-list thì xử lý sự kiện click
                if (window.location.pathname.includes("product-list")) {
                    e.preventDefault();
                    category = catParam;
                    search = "";
                    if (searchEl) searchEl.value = "";

                    const params = new URLSearchParams();
                    if (category) {
                        params.set("category", category);
                    }

                    const qs = params.toString();
                    let finalUrl = window.location.pathname;
                    if (qs) {
                        finalUrl = "?" + qs;
                    }
                    history.replaceState({}, "", finalUrl);

                    syncCategoryUI();
                    updateBreadcrumb();
                    renderList();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    readURLParams();

    if (searchEl) {
        searchEl.addEventListener("input", function () {
            search = searchEl.value.trim();
            updateBreadcrumb();
            renderList();
        });
    }

    if (sortEl) {
        sortEl.addEventListener("change", function () {
            sortBy = sortEl.value;
            renderList();
        });
    }

    setTimeout(bindNavEvents, 0);

    // Lấy danh sách sản phẩm từ file JSON
    fetch("/assets/products.json")
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            allProducts = [];
            if (Array.isArray(data)) {
                allProducts = data;
            }
            grid.innerHTML = "";
            renderCategoryBar();
            updateBreadcrumb();
            renderList();
        })
        .catch(function (err) {
            console.error("Lỗi tải sản phẩm:", err);
            grid.innerHTML =
                '<div class="pl-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Lỗi tải sản phẩm.</p></div>';
        });
});
