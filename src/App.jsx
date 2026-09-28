import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import data from "./data";

function App() {
  // =========================================================
  // STATE
  // =========================================================

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hero slider
  const [slide, setSlide] = useState(0);

  // Large product view
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Customer details
  const [customer, setCustomer] = useState({
    name: "",
    mobile: "",
    address: "",
  });

  // =========================================================
  // HERO DATA
  // =========================================================

  const slides = data.hero?.slides || [];

  // Keep slide index safe if slides are changed in data.js.
  useEffect(() => {
    if (slide >= slides.length) {
      setSlide(0);
    }
  }, [slide, slides.length]);

  // Automatic hero slider.
  useEffect(() => {
    if (!data.hero?.autoplay || slides.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setSlide((current) => (current + 1) % slides.length);
    }, Number(data.hero.interval) || 4500);

    return () => clearInterval(timer);
  }, [slides.length]);

  // =========================================================
  // BODY LOCK WHEN MODAL / CART IS OPEN
  // =========================================================

  useEffect(() => {
    document.body.style.overflow =
      cartOpen || selectedProduct ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, selectedProduct]);

  // =========================================================
  // ESCAPE KEY
  // =========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setSelectedProduct(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // =========================================================
  // CART
  // =========================================================

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setCartOpen(true);
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  // =========================================================
  // PRICE CALCULATIONS
  // =========================================================

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * item.quantity,
    0
  );

  const actualCartTotal = cart.reduce((total, item) => {
    const actualPrice =
      item.sale === true && item.oldPrice
        ? Number(item.oldPrice)
        : Number(item.price || 0);

    return total + actualPrice * item.quantity;
  }, 0);

  const totalSavings = Math.max(
    actualCartTotal - cartTotal,
    0
  );

  const cartQuantity = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // =========================================================
  // PRODUCT SEARCH / CATEGORY
  // =========================================================

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (data.products || []).filter((product) => {
      const matchesCategory =
        category === "All" ||
        product.category === category;

      const searchableText = [
        product.name,
        product.category,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  // =========================================================
  // WHATSAPP PRODUCT
  // =========================================================

  const whatsappProduct = (product) => {
    const phone = String(
      data.brand?.whatsapp || data.brand?.phone || ""
    ).replace(/\D/g, "");

    if (!phone) {
      alert("WhatsApp number is not configured in data.js.");
      return;
    }

    const actualPrice =
      product.sale === true && product.oldPrice
        ? Number(product.oldPrice)
        : Number(product.price || 0);

    const message =
      `Hello ${data.brand?.name || "Kalavishva"} 👋\n\n` +
      `I am interested in this product:\n\n` +
      `Product: ${product.name}\n` +
      `Category: ${product.category}\n` +
      `Actual Price: ₹${actualPrice}\n` +
      `Offer Price: ₹${product.price}\n` +
      (product.sale === true
        ? `Discount: ${product.saleLabel || "SALE"}\n`
        : "") +
      `\nPlease share more details.\n\nThank you.`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================================
  // WHATSAPP CART ORDER
  // =========================================================

  const whatsappCart = () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!customer.name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!customer.mobile.trim()) {
      alert("Please enter your mobile number.");
      return;
    }

    if (!customer.address.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    const orderText = cart
      .map((item) => {
        const actualPrice =
          item.sale === true && item.oldPrice
            ? Number(item.oldPrice)
            : Number(item.price || 0);

        const offerPrice = Number(item.price || 0);

        const actualItemTotal =
          actualPrice * item.quantity;

        const offerItemTotal =
          offerPrice * item.quantity;

        const itemSavings = Math.max(
          actualItemTotal - offerItemTotal,
          0
        );

        return (
          `• ${item.name}\n` +
          `  Quantity: ${item.quantity}\n` +
          `  Actual Price: ₹${actualPrice} each\n` +
          `  Offer Price: ₹${offerPrice} each\n` +
          (item.sale === true
            ? `  Discount: ${item.saleLabel || "SALE"}\n`
            : "") +
          `  Subtotal: ₹${offerItemTotal}` +
          (itemSavings > 0
            ? `\n  You Save: ₹${itemSavings}`
            : "")
        );
      })
      .join("\n\n");

    const message =
      `Hello ${data.brand?.name || "Kalavishva"} 👋\n\n` +
      `I want to place an order.\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `CUSTOMER DETAILS\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `Name: ${customer.name.trim()}\n` +
      `Mobile: ${customer.mobile.trim()}\n` +
      `Address: ${customer.address.trim()}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `ORDER DETAILS\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `${orderText}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `PRICE SUMMARY\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `Actual Total: ₹${actualCartTotal}\n` +
      `Payable Amount : ₹${cartTotal}\n` +
      `You Save: ₹${totalSavings}\n\n` +
      `Please confirm my order and availability.\n\n` +
      `Thank you.`;

    const phone = String(
      data.brand?.whatsapp || data.brand?.phone || ""
    ).replace(/\D/g, "");

    if (!phone) {
      alert("WhatsApp number is not configured in data.js.");
      return;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================================
  // HERO CONTROLS
  // =========================================================

  const previousSlide = () => {
    if (slides.length <= 1) return;

    setSlide(
      (current) =>
        (current - 1 + slides.length) % slides.length
    );
  };

  const nextSlide = () => {
    if (slides.length <= 1) return;

    setSlide(
      (current) => (current + 1) % slides.length
    );
  };

  // Reset autoplay timer when manually changing slide.
  const selectSlide = (index) => {
    setSlide(index);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="app">

      {/* =====================================================
          ANNOUNCEMENT
      ===================================================== */}

      {data.announcement?.enabled && (
        <div className="announcement">
          {data.announcement.text}
        </div>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="header">
        <div className="header-inner">

          <button
            className="mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Open menu"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

          <a
            href="#home"
            className="logo-area"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src={data.brand.logo}
              alt={`${data.brand.name} logo`}
              className="logo"
            />

            <div>
              <div className="brand-name">
                {data.brand.name}
              </div>

              <div className="tagline">
                {data.brand.tagline}
              </div>
            </div>
          </a>

          <nav
            className={`navigation ${
              menuOpen ? "navigation-open" : ""
            }`}
          >
            {data.navigation.map((item) => (
              <a
                key={item.name}
                href={item.link}
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="header-actions">

            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <button
              className="cart-button"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingBag size={21} />

              {cartQuantity > 0 && (
                <span className="cart-count">
                  {cartQuantity}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* =====================================================
          HERO SLIDER
      ===================================================== */}

      {data.hero?.enabled && slides.length > 0 && (
        <section id="home" className="hero">

          <div className="hero-image-slider">
            <img
              key={slide}
              src={slides[slide].image}
              alt={slides[slide].title || "Kalavishva"}
              className="hero-slide-image"
            />
          </div>

          <div className="hero-overlay"></div>

          <div className="hero-content">

            <p className="hero-small">
              {data.brand.tagline}
            </p>

            <h1>
              {slides[slide].title}
            </h1>

            <p>
              {slides[slide].subtitle}
            </p>

            <a
              href={slides[slide].buttonLink}
              className="primary-button"
            >
              {slides[slide].buttonText}
              <ArrowRight size={18} />
            </a>

          </div>

          {slides.length > 1 && (
            <>
              <button
                className="slider-arrow slider-left"
                onClick={previousSlide}
                aria-label="Previous slide"
              >
                <ChevronLeft />
              </button>

              <button
                className="slider-arrow slider-right"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <ChevronRight />
              </button>

              <div className="slider-dots">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={
                      index === slide
                        ? "dot active"
                        : "dot"
                    }
                    onClick={() =>
                      selectSlide(index)
                    }
                    aria-label={`Go to slide ${
                      index + 1
                    }`}
                  />
                ))}
              </div>
            </>
          )}

        </section>
      )}

      {/* =====================================================
          STORY
      ===================================================== */}

      {data.story?.enabled && (
        <section className="story-section">

          <div className="story-image">
            <img
              src={data.story.image}
              alt={data.story.title}
            />
          </div>

          <div className="story-content">

            <p className="section-small-title">
              {data.story.smallTitle}
            </p>

            <h2>
              {data.story.title}
            </h2>

            <p>
              {data.story.description}
            </p>

            <a
              href={data.story.buttonLink}
              className="outline-button"
            >
              {data.story.buttonText}
              <ArrowRight size={17} />
            </a>

          </div>
        </section>
      )}

      {/* =====================================================
          SHOP
      ===================================================== */}

      <section id="shop" className="shop-section">

        <div className="section-heading">

          <p className="section-small-title">
            DISCOVER OUR COLLECTION
          </p>

          <h2>Made with soul</h2>

          <p>
            Explore our handcrafted creations.
          </p>

        </div>

        <div className="categories">

          {(data.categories || []).map(
            (item) => (
              <button
                key={item}
                className={
                  category === item
                    ? "category active"
                    : "category"
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>
            )
          )}

        </div>

        {filteredProducts.length > 0 ? (

          <div className="product-grid">

            {filteredProducts.map(
              (product) => (
                <article
                  className="product-card"
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setSelectedProduct(product)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      setSelectedProduct(product);
                    }
                  }}
                >

                  <div className="product-image-wrapper">

                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />

                    {product.sale === true && (
                      <span className="sale-badge">
                        {product.saleLabel ||
                          "SALE"}
                      </span>
                    )}

                  </div>

                  <div className="product-info">

                    <p className="product-category">
                      {product.category}
                    </p>

                    <h3>
                      {product.name}
                    </h3>

                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="price">

                      {product.sale === true &&
                        product.oldPrice && (
                          <del>
                            ₹{product.oldPrice}
                          </del>
                        )}

                      <span>
                        ₹{product.price}
                      </span>

                    </div>

                    <div className="product-buttons">

                      <button
                        className="add-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          addToCart(product);
                        }}
                      >
                        Add to Cart
                      </button>

                      <button
                        className="whatsapp-product"
                        onClick={(event) => {
                          event.stopPropagation();
                          whatsappProduct(product);
                        }}
                        aria-label={`Contact WhatsApp about ${product.name}`}
                        title="Contact on WhatsApp"
                      >
                        <MessageCircle size={19} />
                      </button>

                    </div>

                  </div>

                </article>
              )
            )}

          </div>

        ) : (

          <div className="empty-cart">

            <Search size={40} />

            <h3>
              No products found
            </h3>

            <p>
              Try another search or category.
            </p>

            <button
              className="primary-button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              View All Products
            </button>

          </div>
        )}

      </section>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section id="about" className="about-section">

        <div className="about-content">

          <p className="section-small-title">
            ABOUT KALAVISHVA
          </p>

          <h2>
            {data.about.title}
          </h2>

          <p>
            {data.about.description}
          </p>

          <div className="about-points">

            {(data.about.points || []).map(
              (point, index) => (
                <div
                  className="about-point"
                  key={index}
                >
                  <div className="about-point-number">
                    0{index + 1}
                  </div>

                  <p>
                    {point}
                  </p>
                </div>
              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <section
        id="contact"
        className="contact-section"
      >

        <div>

          <p className="section-small-title">
            GET IN TOUCH
          </p>

          <h2>
            We'd love to hear from you.
          </h2>

          <p>
            Have a question about a product?
            Contact Kalavishva directly.
          </p>

        </div>

        <div className="contact-details">

          <a
            href={`mailto:${data.brand.email}`}
          >
            <Mail size={20} />
            {data.brand.email}
          </a>

          <a
            href={`tel:${data.brand.phone}`}
          >
            <Phone size={20} />
            {data.brand.phone}
          </a>

          <a
            href={`https://wa.me/${String(
              data.brand.whatsapp || ""
            ).replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={20} />
            WhatsApp
          </a>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <div className="footer-brand">

          <img
            src={data.brand.logo}
            alt={data.brand.name}
          />

          <h3>
            {data.brand.name}
          </h3>

          <p>
            {data.brand.tagline}
          </p>

          <p>
            {data.footer.description}
          </p>

        </div>

        <div className="footer-links">

          <h4>
            Quick Links
          </h4>

          {(data.navigation || []).map(
            (item) => (
              <a
                href={item.link}
                key={item.name}
              >
                {item.name}
              </a>
            )
          )}

        </div>

        <div className="footer-contact">

          <h4>
            Contact
          </h4>

          <p>
            {data.brand.email}
          </p>

          <p>
            {data.brand.phone}
          </p>

          <p>
            {data.brand.location}
          </p>

        </div>

        <div className="footer-bottom">
          {data.footer.copyright}
        </div>

      </footer>

      {/* =====================================================
          LARGE PRODUCT DETAIL
      ===================================================== */}

      {selectedProduct && (
        <div
          className="product-detail-overlay"
          onClick={() =>
            setSelectedProduct(null)
          }
        >

          <div
            className="product-detail"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="product-back-button"
              onClick={() =>
                setSelectedProduct(null)
              }
              aria-label="Back to products"
            >
              <ChevronLeft size={20} />
              Back
            </button>

            <button
              className="product-detail-close"
              onClick={() =>
                setSelectedProduct(null)
              }
              aria-label="Close product"
            >
              <X size={22} />
            </button>

            <div className="product-detail-content">

              <div className="product-detail-image-box">

                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="product-detail-image"
                />

              </div>

              <div className="product-detail-info">

                <p className="product-category">
                  {selectedProduct.category}
                </p>

                <h1>
                  {selectedProduct.name}
                </h1>

                <p className="product-detail-description">
                  {selectedProduct.description}
                </p>

                <div className="product-detail-price">

                  {selectedProduct.sale === true &&
                    selectedProduct.oldPrice && (
                      <del>
                        ₹{selectedProduct.oldPrice}
                      </del>
                    )}

                  <strong>
                    ₹{selectedProduct.price}
                  </strong>

                </div>

                {selectedProduct.sale === true && (
                  <span className="product-detail-sale">
                    {selectedProduct.saleLabel ||
                      "SALE"}
                  </span>
                )}

                <button
                  className="product-detail-cart"
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  <ShoppingBag size={19} />
                  Add to Cart
                </button>

                <button
                  className="product-detail-whatsapp"
                  onClick={() =>
                    whatsappProduct(
                      selectedProduct
                    )
                  }
                >
                  <MessageCircle size={19} />
                  Contact on WhatsApp
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          CART DRAWER
      ===================================================== */}

      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={() => setCartOpen(false)}
        >

          <aside
            className="cart-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="cart-header">

              <h2>
                Your Cart
              </h2>

              <button
                onClick={() =>
                  setCartOpen(false)
                }
                aria-label="Close cart"
              >
                <X size={22} />
              </button>

            </div>

            {cart.length === 0 ? (

              <div className="empty-cart">

                <ShoppingBag size={45} />

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add something beautiful
                  to your cart.
                </p>

                <button
                  className="primary-button"
                  onClick={() =>
                    setCartOpen(false)
                  }
                >
                  Continue Shopping
                </button>

              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cart.map((item) => {

                    const actualPrice =
                      item.sale === true &&
                      item.oldPrice
                        ? Number(item.oldPrice)
                        : Number(item.price || 0);

                    const offerPrice =
                      Number(item.price || 0);

                    const itemActualTotal =
                      actualPrice * item.quantity;

                    const itemOfferTotal =
                      offerPrice * item.quantity;

                    const itemSavings =
                      Math.max(
                        itemActualTotal -
                          itemOfferTotal,
                        0
                      );

                    return (
                      <div
                        className="cart-item"
                        key={item.id}
                      >

                        <img
                          src={item.image}
                          alt={item.name}
                        />

                        <div className="cart-item-info">

                          <h4>
                            {item.name}
                          </h4>

                          <div className="cart-item-price">

                            {item.sale === true &&
                              item.oldPrice && (
                                <del>
                                  ₹{actualPrice}
                                </del>
                              )}

                            <strong>
                              ₹{offerPrice}
                            </strong>

                            {item.sale === true && (
                              <span className="cart-discount">
                                {item.saleLabel ||
                                  "SALE"}
                              </span>
                            )}

                          </div>

                          {itemSavings > 0 && (
                            <p className="cart-item-saving">
                              You save ₹{itemSavings}
                            </p>
                          )}

                          <div className="quantity">

                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus size={15} />
                            </button>

                            <span>
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus size={15} />
                            </button>

                          </div>

                        </div>

                        <button
                          className="delete-button"
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                          aria-label="Remove product"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>
                    );
                  })}

                </div>

                <div className="cart-summary">

                  <div className="customer-form">

                    <h3>
                      Customer Details
                    </h3>

                    <label>
                      Full Name

                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={customer.name}
                        onChange={(event) =>
                          setCustomer({
                            ...customer,
                            name: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Mobile Number

                      <input
                        type="tel"
                        placeholder="Enter mobile number"
                        value={customer.mobile}
                        onChange={(event) =>
                          setCustomer({
                            ...customer,
                            mobile:
                              event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Delivery Address with pincode

                      <textarea
                        rows="3"
                        placeholder="Enter complete delivery address"
                        value={customer.address}
                        onChange={(event) =>
                          setCustomer({
                            ...customer,
                            address:
                              event.target.value,
                          })
                        }
                      />
                    </label>

                  </div>

                  <div className="cart-price-summary">

                    <div>
                      <span>
                        Actual Price
                      </span>

                      <strong>
                        ₹{actualCartTotal}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Payable Amount
                      </span>

                      <strong>
                        ₹{cartTotal}
                      </strong>
                    </div>

                    {totalSavings > 0 && (
                      <div className="you-save">
                        You Save ₹{totalSavings}
                      </div>
                    )}

                  </div>

                  <div className="cart-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹{cartTotal}
                    </strong>

                  </div>

                  <button
                    className="whatsapp-order-button"
                    onClick={whatsappCart}
                  >
                    <MessageCircle size={18} />
                    Place Order on WhatsApp
                  </button>

                  <p className="cart-note">
                    Your name, mobile number,
                    address, products and
                    quantities will be included
                    automatically in WhatsApp.
                  </p>

                </div>

              </>
            )}

          </aside>

        </div>
      )}

    </div>
  );
}

export default App;