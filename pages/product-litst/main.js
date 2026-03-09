const products = [
  {
    id: 1,
    name: "Áo thun nam basic",
    price: 250000,
    gender: "Nam",
    category: "ao-thun",
    image: "img//aothun1.jpg",
  },

  {
    id: 2,
    name: "Quần tay nam",
    price: 450000,
    gender: "Nam",
    category: "quan-dai",
    image: "img//quantaynam1.jpg",
  },
  {
    id: 3,
    name: "Giày thể thao nam",
    price: 700000,
    gender: "Nam",
    category: "giay",
    image: "img//giay1.jpg",
  },
  {
    id: 4,
    name: "Áo thun nữ",
    price: 300000,
    gender: "Nữ",
    category: "ao-thun",
    image: "img//aothunnu2.png",
  },
  {
    id: 5,
    name: "váy nữ",
    price: 500000,
    gender: "Nữ",
    category: "quan-short",
    image: "img//vay3.webp",
  },
  {
    id: 6,
    name: "Giày nữ",
    price: 800000,
    gender: "Nữ",
    category: "giay",
    image: "img//giaynu1.webp",
  },
  {
    id: 7,
    name: "Áo Polo nam basic",
    price: 250000,
    gender: "Nam",
    category: "ao-polo",
    image: "img//aopolo1.jpg",
  },
  {
    id: 8,
    name: "Áo thun nam basic",
    price: 250000,
    gender: "Nam",
    category: "ao-thun",
    image: "img//aothun2.jpg",
  },
  {
    id: 9,
    name: "Áo thun nam basic",
    price: 250000,
    gender: "Nam",
    category: "ao-thun",
    image: "img//aothun4.jpg",
  },
  {
    id: 10,
    name: "Áo thun nam basic",
    price: 250000,
    gender: "Nam",
    category: "ao-thun",
    image: "img//aothun3.jpg",
  },
  {
    id: 11,
    name: "Áo thun nam basic",
    price: 250000,
    gender: "Nam",
    category: "ao-thun",
    image: "img//aothun5.jpg",
  },
  {
    id: 12,
    name: "Áo polo nam basic",
    price: 250000,
    gender: "Nam",
    category: "ao-polo",
    image: "img//aopolo2.jpg",
  },
  {
    id: 13,
    name: "Áo polo basic",
    price: 250000,
    gender: "Nam",
    category: "ao-polo",
    image: "img//aopolo3.jpg",
  },
  {
    id: 14,
    name: "Áo polo basic",
    price: 250000,
    gender: "Nam",
    category: "ao-polo",
    image: "img//aopolo4.jpg",
  },
  {
    id: 15,
    name: "Áo sơ mi nam",
    price: 250000,
    gender: "Nam",
    category: "ao-so-mi",
    image: "img//aosomi1.jpg",
  },
  {
    id: 16,
    name: "Áo sơ mi nam",
    price: 250000,
    gender: "Nam",
    category: "ao-so-mi",
    image: "img//aosomi2.jpg",
  },
  {
    id: 17,
    name: "Áo sơ mi nam",
    price: 250000,
    gender: "Nam",
    category: "ao-so-mi",
    image: "img//aosomi3.jpg",
  },
  {
    id: 18,
    name: "Áo khoac bomber",
    price: 250000,
    gender: "Nam",
    category: "ao-khoac",
    image: "img//aokhoacbomber1.jpg",
  },
  {
    id: 19,
    name: "Áo khoac hoodie",
    price: 250000,
    gender: "Nam",
    category: "ao-khoac",
    image: "img//aokhoachoodie1.jpg",
  },
  {
    id: 20,
    name: "Áo khoac jeans",
    price: 250000,
    gender: "Nam",
    category: "ao-khoac",
    image: "img//aokhoacjeans1.jpg",
  },
  {
    id: 21,
    name: "quan short",
    price: 250000,
    gender: "Nam",
    category: "quan-short",
    image: "img//quanshort1.jpg",
  },
  {
    id: 22,
    name: "quan short",
    price: 250000,
    gender: "Nam",
    category: "quan-short",
    image: "img//quanshort2.jpg",
  },
  {
    id: 23,
    name: "quan short",
    price: 250000,
    gender: "Nam",
    category: "quan-short",
    image: "img//quanshort3.jpg",
  },
  {
    id: 24,
    name: "quan dai",
    price: 250000,
    gender: "Nam",
    category: "quan-dai",
    image: "img//quanjeans1.jpg",
  },
  {
    id: 25,
    name: "quan dai",
    price: 250000,
    gender: "Nam",
    category: "quan-dai",
    image: "img//quanjeans2.jpg",
  },
  {
    id: 26,
    name: "quan dai",
    price: 250000,
    gender: "Nam",
    category: "quan-dai",
    image: "img//quantay1.jpg",
  },
  {
    id: 27,
    name: "Giày thể thao nam",
    price: 700000,
    gender: "Nam",
    category: "giay",
    image: "img//giay2.jpg",
  },
  {
    id: 28,
    name: "Giày thể thao nam",
    price: 700000,
    gender: "Nam",
    category: "giay",
    image: "img//giay3.jpg",
  },
  {
    id: 29,
    name: "Áo thun nữ",
    price: 300000,
    gender: "Nữ",
    category: "ao-thun",
    image: "img//aothunnu2.png",
  },
  {
    id: 30,
    name: "Áo polo nữ",
    price: 300000,
    gender: "Nữ",
    category: "ao-polo",
    image: "img//aopolonu1.png",
  },
  {
    id: 31,
    name: "Áo polo nữ",
    price: 300000,
    gender: "Nữ",
    category: "ao-polo",
    image: "img//aopolonu2.png",
  },
  {
    id: 32,
    name: "Áo sơ mi nữ",
    price: 300000,
    gender: "Nữ",
    category: "ao-so-mi",
    image: "img//aosominu1.png",
  },
  {
    id: 33,
    name: "Áo sơ mi nữ",
    price: 300000,
    gender: "Nữ",
    category: "ao-so-mi",
    image: "img//aosominu2.png",
  },
  {
    id: 34,
    name: "Quần dài nữ",
    price: 300000,
    gender: "Nữ",
    category: "quan-dai",
    image: "img//quandainu1.jpg",
  },
  {
    id: 35,
    name: "Quần dài nữ",
    price: 300000,
    gender: "Nữ",
    category: "quan-dai",
    image: "img//quandainu2.jpg",
  },
  {
    id: 36,
    name: "Quần short nữ",
    price: 300000,
    gender: "Nữ",
    category: "quan-short",
    image: "img//quanshortnu1.jpeg",
  },
  {
    id: 37,
    name: "Quần short nữ",
    price: 300000,
    gender: "Nữ",
    category: "quan-short",
    image: "img//quanshortnu2.webp",
  },
  {
    id: 38,
    name: "váy nữ",
    price: 300000,
    gender: "Nữ",
    category: "quan-short",
    image: "img//vay1.webp",
  },
  {
    id: 39,
    name: "váy nữ",
    price: 300000,
    gender: "Nữ",
    category: "quan-short",
    image: "img//vay2.webp",
  },
  {
    id: 40,
    name: "Giày nữ",
    price: 800000,
    gender: "Nữ",
    category: "giay",
    image: "img//giaynu2.jpg",
  },
  {
    id: 41,
    name: "Áo khoác nữ",
    price: 300000,
    gender: "Nữ",
    category: "ao-khoac",
    image: "img//aokhoacnu1.jpg",
  },
  {
    id: 42,
    name: "Áo khoác nữ",
    price: 300000,
    gender: "Nữ",
    category: "ao-khoac",
    image: "img//aokhoacnu2.webp",
  },
];
// ------------------------- state -------------------------
let currentGender = "";
let currentSort = "";
let currentCategory = "";
/* ================= DOM ELEMENTS ================= */

const productGrid = document.getElementById("productGrid");
const logo = document.querySelector(".header__logo");
const navLinks = document.querySelectorAll(".nav__link");
const searchToggle = document.getElementById("searchToggle");
const searchOverlay = document.getElementById("searchOverlay");
const closeSearch = document.getElementById("closeSearch");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortPrice");

/* ================= RENDER PRODUCTS ================= */
function renderProducts(list) {
  productGrid.innerHTML = "";

  if (list.length === 0) {
    productGrid.innerHTML = "<p>Không tìm thấy sản phẩm</p>";
    return;
  }

  list.forEach((p) => {
    const card = `
    <div class="product__card">
    
    <img src="${p.image}" class="product__image">
    
    <div class="product__info">
    <h3 class="product__title">${p.name}</h3>
          <p class="product__price">${p.price.toLocaleString()}đ</p>
        </div>
        
        </div>
        `;

    productGrid.innerHTML += card;
  });
}
/* ================= FILTER PRODUCTS ================= */
function applyFilters() {
  let filtered = [...products];

  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  /* ================= SEARCH ƯU TIÊN CAO NHẤT ================= */
  if (keyword) {
    filtered = products.filter((p) => p.name.toLowerCase().includes(keyword));
  } else {
    /* GENDER */
    if (currentGender) {
      filtered = filtered.filter((p) => p.gender === currentGender);
    }

    /* CATEGORY */
    if (currentCategory) {
      filtered = filtered.filter((p) => p.category === currentCategory);
    }
  }

  /* SORT */
  if (sortSelect && sortSelect.value === "asc") {
    filtered.sort((a, b) => a.price - b.price);
  }

  if (sortSelect && sortSelect.value === "desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  renderProducts(filtered);
}
/* LOGO - HIỆN TẤT CẢ SẢN PHẨM */
/* ================= HEADER EVENTS ================= */

if (logo) {
  logo.addEventListener("click", () => {
    currentGender = "";
    currentCategory = "";
    currentSort = "";

    if (sortSelect) sortSelect.value = "";
    if (searchInput) searchInput.value = "";

    applyFilters();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}
/* ================= NAVIGATION ================= */

navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    // xóa active cũ
    navLinks.forEach((l) => l.classList.remove("nav__link--active"));

    // thêm active mới
    this.classList.add("nav__link--active");
  });
});

/* GENDER */
document.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", function (e) {
    const gender = this.dataset.gender;

    if (gender) {
      // chỉ xử lý Nam hoặc Nữ
      e.preventDefault();

      currentGender = gender; // luôn gán theo giới tính được click
      currentCategory = ""; // reset category

      applyFilters();
      // cuộn lên đầu trang
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  });
});
/* ================= CATEGORY ================= */
document.querySelectorAll(".dropdown__item").forEach((item) => {
  item.addEventListener("click", function () {
    currentGender = this.dataset.gender;
    currentCategory = this.dataset.category;
    applyFilters();
    // cuộn lên đầu trang
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});

/* SORT */
const sortElement = document.getElementById("sortPrice");
if (sortElement) {
  sortElement.addEventListener("change", applyFilters);
}
/* SEARCH */
const searchInputElement = document.getElementById("searchInput");
if (searchInputElement) {
  searchInputElement.addEventListener("input", applyFilters);
}
/* SEARCH OVERLAY */

if (searchToggle) {
  searchToggle.addEventListener("click", () => {
    searchOverlay.classList.add("search-overlay--active");
  });
}

if (closeSearch) {
  closeSearch.addEventListener("click", () => {
    searchOverlay.classList.remove("search-overlay--active");
  });
}

/* INITIAL LOAD */
renderProducts(products);
