document.addEventListener('DOMContentLoaded', () => {
    /* ====================================================
       1. NAVIGATION & HEADER MODULE
       ====================================================== */
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    let lastScrollTop = 0;

    // Scroll hide/show header
    if (header) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.classList.add('hide');
            } else if (scrollTop < lastScrollTop) {
                header.classList.remove('hide');
            }
            lastScrollTop = scrollTop;
        });
    }

    // Mobile menu toggle (Updated to match mobile-first 'is-active' naming convention)
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('is-active');
            navLinks.classList.toggle('is-active');
        });
    }

    // Function to set active nav link
    function setActiveNavLink() {
        const currentPage = window.location.pathname;
        const links = document.querySelectorAll('.nav-links a');

        links.forEach(link => {
            link.classList.remove('active');
            try {
                const linkPath = new URL(link.href).pathname;
                if (linkPath === currentPage) {
                    link.classList.add('active');
                }
                // Special case for index.html and root
                if (currentPage === '/' || currentPage === '/index.html' || currentPage === '') {
                    if (linkPath === '/index.html' || linkPath === '/') {
                        link.classList.add('active');
                    }
                }
            } catch (e) {
                // Catch potential URL parsing issues for relative hashes
            }
        });

        // Handle dropdown product link for catalog pages
        const productLink = document.querySelector('.product-link');
        const catalogPages = ['/catalog/catalog.html', '/catalog/', '/products/'];

        if (productLink && catalogPages.some(page => currentPage.includes(page))) {
            productLink.classList.add('active');
        }
    }

    // Set active nav link on page load
    setActiveNavLink();

    // Update active state when navigating (for SPA-like behavior)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function () {
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Close mobile menu smoothly using the updated mobile-first selector
            if (hamburger && navLinks && hamburger.classList.contains('is-active')) {
                hamburger.classList.remove('is-active');
                navLinks.classList.remove('is-active');
            }
        });
    });

    // Update active state on browser back/forward
    window.addEventListener('popstate', setActiveNavLink);


    /* ====================================================
       2. SHOPPING CART MODULE
       ====================================================== */
    const cartIcon = document.querySelector('.cart-toggle');
    const cart = document.querySelector('.cart');
    const cartContent = document.querySelector('.cart-content');

    if (cartIcon && cart) {
        // Add cart counter to the icon
        const cartCounter = document.createElement('span');
        cartCounter.className = 'cart-counter';
        cartCounter.textContent = '0';
        cartIcon.appendChild(cartCounter);

        if (window.getComputedStyle(cartIcon).position === 'static') {
            cartIcon.style.position = 'relative';
        }

        // Add overlay
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        document.body.appendChild(overlay);

        // Add close button to cart
        const cartTitle = document.querySelector('.cart-title');
        const closeButton = document.createElement('button');
        closeButton.className = 'close-cart';
        closeButton.innerHTML = '<i class="fa-solid fa-times"></i>';
        if (cartTitle) cartTitle.appendChild(closeButton);

        let currencySymbol = 'R';
        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

        const detectCurrency = () => {
            const priceElements = document.querySelectorAll('.product-price');
            if (priceElements.length > 0) {
                const firstPrice = priceElements[0].textContent.trim();
                const match = firstPrice.match(/^[^\d\s.]+/);
                if (match && match[0]) currencySymbol = match[0];
            }
            return currencySymbol;
        };
        currencySymbol = detectCurrency();

        function parsePrice(priceString) {
            return parseFloat(priceString.replace(/[^\d.]/g, ''));
        }

        function formatPrice(amount) {
            return `${currencySymbol}${amount.toFixed(2)}`;
        }

        function openCart(e) {
            if (e && e.preventDefault) e.preventDefault();
            cart.classList.add('open');
            const cartOverlay = document.querySelector('.cart-overlay');
            if (cartOverlay) cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeCart() {
            cart.classList.remove('open');
            const cartOverlay = document.querySelector('.cart-overlay');
            if (cartOverlay) cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        cartIcon.addEventListener('click', openCart);
        if (closeButton) closeButton.addEventListener('click', closeCart);
        overlay.addEventListener('click', closeCart);

        function saveCart() {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        }

        function generateProductId(title) {
            return title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        }

        function calculateSubtotal() {
            return cartItems.reduce((total, item) => total + (item.numericPrice * item.quantity), 0);
        }

        function updateCartCounter() {
            const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
            cartCounter.textContent = itemCount;
            cartCounter.style.display = itemCount > 0 ? 'flex' : 'none';
        }

        // Product interaction event delegation
        const productContainer = document.querySelector('.products-container') || document.body;
        productContainer.addEventListener('click', function (event) {
            const card = event.target.closest('.product-card');
            
            if (event.target.classList.contains('quantity-btn') && card) {
                const quantityDisplay = card.querySelector('.quantity-display');
                let quantity = parseInt(quantityDisplay.textContent);
                
                if (event.target.classList.contains('minus') && quantity > 1) {
                    quantity--;
                } else if (event.target.classList.contains('plus')) {
                    quantity++;
                }
                quantityDisplay.textContent = quantity;
            }

            if (event.target.classList.contains('add-to-cart-btn') && card) {
                const addToCartBtn = event.target;
                addToCartBtn.setAttribute('aria-busy', 'true');
                addToCartBtn.value = addToCartBtn.getAttribute('data-loading-text') || 'LOADING...';

                const productTitle = card.querySelector('.product-title h3').textContent;
                const productDetail = card.querySelector('.product-detail p').textContent;
                const productPrice = card.querySelector('.product-price').textContent.trim();
                const numericPrice = parsePrice(productPrice);
                const productId = generateProductId(productTitle);
                const quantityDisplay = card.querySelector('.quantity-display');
                let quantity = parseInt(quantityDisplay.textContent);

                const product = {
                    id: productId, title: productTitle, detail: productDetail,
                    price: productPrice, numericPrice: numericPrice, quantity: quantity
                };

                const existingProductIndex = cartItems.findIndex(item => item.id === productId);
                if (existingProductIndex !== -1) {
                    cartItems[existingProductIndex].quantity += quantity;
                } else {
                    cartItems.push(product);
                }

                setTimeout(() => {
                    saveCart();
                    renderCartItems();
                    updateCartCounter();
                    addToCartBtn.setAttribute('aria-busy', 'false');
                    addToCartBtn.value = 'ADD TO CART';
                    showAddedToCartMessage(productTitle);
                    openCart();
                }, 800);
            }
        });

        // Cart content item interactions delegation
        if (cartContent) {
            cartContent.addEventListener('click', function (event) {
                const productContainer = event.target.closest('.cart-product-container');
                if (!productContainer) return;
                
                const index = parseInt(productContainer.getAttribute('data-product-index'));
                if (isNaN(index)) return;

                if (event.target.classList.contains('cart-product-btn')) {
                    removeCartItem(index);
                } else if (event.target.classList.contains('fa-arrow-up')) {
                    updateItemQuantity(index, 1);
                } else if (event.target.classList.contains('fa-arrow-down')) {
                    const quantityText = event.target.parentNode.textContent.trim();
                    if (parseInt(quantityText) > 1) {
                        updateItemQuantity(index, -1);
                    }
                }
            });
        }

        function renderCartItems() {
            if (!cartContent) return;
            const existingProductInfo = cartContent.querySelector('.cart-product-info');
            if (existingProductInfo) cartContent.removeChild(existingProductInfo);

            const cartProductsContainer = document.createElement('div');
            cartProductsContainer.className = 'cart-product-info';

            if (cartItems.length === 0) {
                const emptyCartMessage = document.createElement('div');
                emptyCartMessage.className = 'empty-cart-message';
                emptyCartMessage.style.cssText = 'padding:1.5rem; text-align:center; display:flex; flex-direction:column; gap:1.5rem;';
                
                const emptyMessage = document.createElement('p');
                emptyMessage.innerHTML = 'Your cart is empty😢 <br> Please add items before checkout 👇';
                emptyCartMessage.appendChild(emptyMessage);

                const continueShoppingBtn = document.createElement('button');
                continueShoppingBtn.className = 'continue-shopping-btn';
                continueShoppingBtn.textContent = 'Continue Shopping';
                continueShoppingBtn.style.cssText = 'margin-top:1rem; border:none; border-radius:4px; backgroundColor:#3d8b40; color:#fff; padding:13px 32px; fontSize:1.2rem; cursor:pointer;';
                continueShoppingBtn.addEventListener('click', () => {
                    closeCart();
                    window.location.href = '/index.html#products';
                });

                emptyCartMessage.appendChild(continueShoppingBtn);
                cartProductsContainer.appendChild(emptyCartMessage);
            } else {
                cartItems.forEach((item, index) => {
                    cartProductsContainer.appendChild(createProductElement(item, index));
                });
            }

            const checkoutSection = cartContent.querySelector('.cart-checkout');
            cartContent.insertBefore(cartProductsContainer, checkoutSection);
            updateSubtotal();
        }

        function createProductElement(product, index) {
            const productContainer = document.createElement('div');
            productContainer.className = 'cart-product-container';
            productContainer.setAttribute('data-product-index', index);
            productContainer.style.cssText = 'margin-bottom:2rem; border-bottom:1px solid #1A4170; padding-bottom:15px; display:flex; align-items:center; justify-content:space-between; width:100%;';

            const productInfo = document.createElement('div');
            productInfo.className = 'cart-product';
            productInfo.style.cssText = 'display:flex; justify-content:space-between; align-items:start;';

            const productTitle = document.createElement('div');
            productTitle.className = 'cart-product-title';
            const titleH3 = document.createElement('h3');
            titleH3.textContent = product.title;
            productTitle.appendChild(titleH3);

            const productPrice = document.createElement('div');
            productPrice.className = 'cart-product-price';
            const priceP = document.createElement('p');
            priceP.textContent = formatPrice(product.numericPrice * product.quantity);
            productPrice.appendChild(priceP);

            const removeButton = document.createElement('i');
            removeButton.className = 'cart-product-btn fa-solid fa-trash';
            removeButton.style.cssText = 'font-size:1.8rem; cursor:pointer; color:#777;';
            removeButton.setAttribute('title', `Remove ${product.title} from cart`);

            productInfo.appendChild(productTitle);
            productInfo.appendChild(productPrice);
            productInfo.appendChild(removeButton);

            const quantityControls = document.createElement('div');
            quantityControls.className = 'cart-product-arrows';
            const quantitySpan = document.createElement('span');
            const upArrow = document.createElement('i');
            upArrow.className = 'fa-solid fa-arrow-up';
            const quantityText = document.createTextNode(` ${product.quantity} `);
            const downArrow = document.createElement('i');
            downArrow.className = 'fa-solid fa-arrow-down';

            quantitySpan.appendChild(upArrow);
            quantitySpan.appendChild(quantityText);
            quantitySpan.appendChild(downArrow);
            quantityControls.appendChild(quantitySpan);

            productContainer.appendChild(productInfo);
            productContainer.appendChild(quantityControls);

            return productContainer;
        }

        function updateItemQuantity(index, change) {
            cartItems[index].quantity += change;
            saveCart();
            renderCartItems();
            updateCartCounter();
        }

        function removeCartItem(index) {
            cartItems.splice(index, 1);
            saveCart();
            renderCartItems();
            updateCartCounter();
        }

        function updateSubtotal() {
            const subtotal = calculateSubtotal();
            const subtotalElement = document.querySelector('.total');
            if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
        }

        function showAddedToCartMessage(productTitle) {
            const message = document.createElement('div');
            message.className = 'added-to-cart-message';
            message.style.cssText = 'position:fixed; top:20px; right:20px; background-color:#4CAF50; color:white; padding:12px 20px; border-radius:4px; z-index:1000; opacity:0; transition:opacity 0.3s ease;';
            message.textContent = `${productTitle} added to cart 😍`;

            document.body.appendChild(message);
            setTimeout(() => { message.style.opacity = '1'; }, 10);
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => { document.body.removeChild(message); }, 300);
            }, 2000);
        }

        if (cartContent) {
            cartContent.addEventListener('click', function (event) {
                if (event.target.classList.contains('cart-checkout-btn')) {
                    alert('Proceeding to checkout with ' + cartItems.length + ' items totaling ' + formatPrice(calculateSubtotal()));
                }
            });
        }

        // Keyboard navigation accessibility
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && cart.classList.contains('open')) {
                closeCart();
            }
        });

        // Prevent immediate navigation anchor bugs on cart link icons
        const internalLink = cartIcon.querySelector('a');
        if (internalLink) {
            internalLink.addEventListener('click', (e) => e.preventDefault());
        }

        renderCartItems();
        updateCartCounter();
    }


    /* ====================================================
       3. CHECKOUT WORKFLOW MODULE (Multi-page Protected)
       ====================================================== */
    const checkoutCartItems = document.getElementById('checkout-cart-items');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const checkoutNavBtn = document.querySelector('.cart-checkout-btn');

    let currencySymbol = 'R';
    function formatPrice(amount) {
        return `${currencySymbol}${amount.toFixed(2)}`;
    }
    function getCartItems() {
        return JSON.parse(localStorage.getItem('cartItems')) || [];
    }

    function populateCheckoutItems() {
        if (!checkoutCartItems) return; // Exit if not on checkout view
        const cartItems = getCartItems();
        checkoutCartItems.innerHTML = '';

        if (cartItems.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Your cart is empty😢 Please add items before checkout 👇';
            checkoutCartItems.appendChild(emptyMessage);
            if (placeOrderBtn) placeOrderBtn.disabled = true;
            return;
        }

        if (placeOrderBtn) placeOrderBtn.disabled = false;

        cartItems.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';

            const itemInfo = document.createElement('div');
            itemInfo.className = 'item-info';

            const itemQuantity = document.createElement('div');
            itemQuantity.className = 'item-quantity';
            itemQuantity.textContent = item.quantity;

            const itemTitle = document.createElement('span');
            itemTitle.textContent = item.title;

            const itemPrice = document.createElement('div');
            itemPrice.className = 'item-price';
            itemPrice.textContent = formatPrice(item.numericPrice * item.quantity);

            itemInfo.appendChild(itemQuantity);
            itemInfo.appendChild(itemTitle);
            cartItem.appendChild(itemInfo);
            cartItem.appendChild(itemPrice);
            checkoutCartItems.appendChild(cartItem);
        });

        updateOrderTotals();
    }

    function updateOrderTotals() {
        const cartItems = getCartItems();
        const subtotal = cartItems.reduce((total, item) => total + (item.numericPrice * item.quantity), 0);
        const shipping = 50; 
        const tax = subtotal * 0.15;
        const total = subtotal + shipping + tax;

        const subtotalEl = document.getElementById('checkout-subtotal');
        const shippingEl = document.getElementById('checkout-shipping');
        const taxEl = document.getElementById('checkout-tax');
        const totalEl = document.getElementById('checkout-total');

        if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
        if (shippingEl) shippingEl.textContent = formatPrice(shipping);
        if (taxEl) taxEl.textContent = formatPrice(tax);
        if (totalEl) totalEl.textContent = formatPrice(total);
    }

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const orderBtn = this;
            orderBtn.setAttribute('aria-busy', 'true');
            orderBtn.textContent = orderBtn.getAttribute('data-loading-text') || 'PROCESSING...';

            const requiredFields = document.querySelectorAll('input[required], select[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'red';
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!isValid) {
                alert('Please fill in all required fields.');
                orderBtn.setAttribute('aria-busy', 'false');
                orderBtn.textContent = 'Place Order';
                return;
            }

            setTimeout(() => {
                localStorage.removeItem('cartItems');
                alert('Order placed successfully🎉🎊😍! Thank you for your purchase🙌');
                orderBtn.setAttribute('aria-busy', 'false');
                orderBtn.textContent = 'Place Order';
                window.location.reload();
            }, 2000);
        });
    }

    if (checkoutNavBtn) {
        checkoutNavBtn.addEventListener('click', function () {
            if (cart && cart.classList.contains('open')) {
                cart.classList.remove('open');
                const cartOverlay = document.querySelector('.cart-overlay');
                if (cartOverlay) cartOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }

            const targetSection = document.querySelector('.checkout-section');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Initialize checkout arrays natively if on respective viewport template
    populateCheckoutItems();


    /* ====================================================
       4. INTERACTION & WISHLIST MODULE
       ====================================================== */
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });
});


/* ====================================================
   5. INTERACTIVE MULTI-STEP NAVIGATION WIZARD
   ====================================================== */
function nextStep(currentStep, nextStep) {
    const currentForm = document.getElementById(`${currentStep}-form`);
    const nextForm = document.getElementById(`${nextStep}-form`);
    const currentStepIndicator = document.getElementById(`${currentStep}-step`);
    const nextStepIndicator = document.getElementById(`${nextStep}-step`);

    if (currentForm) currentForm.classList.remove('active');
    if (nextForm) nextForm.classList.add('active');
    if (currentStepIndicator) currentStepIndicator.classList.remove('active');
    if (nextStepIndicator) nextStepIndicator.classList.add('active');

    window.scrollTo(0, 0);
}


/* ====================================================
   6. THREE.JS + GSAP HERO GALLERY SYSTEM
   ====================================================== */
const slideData = [
    { title: "Eco Dishwashing Liquid", num: "01", text: "Clean Smarter.<br><span>Plant-Based Power.</span>", desc: "Switch to Boni's premium, plant-based eco-friendly solutions designed for modern luxury spaces." },
    { title: "Eco Glass Cleaner", num: "02", text: "Streak-Free.<br><span>Crystal Clarity.</span>", desc: "Advanced plant-derived formula for brilliant, streak-free shine on all glass surfaces." },
    { title: "Eco Surface Cleaner", num: "03", text: "Tough on Dirt.<br><span>Kind to Nature.</span>", desc: "Multi-surface power that lifts grease and grime easily without toxic chemicals." },
    { title: "Eco Disinfectant", num: "04", text: "Safe Sanitization.<br><span>Maximum Defense.</span>", desc: "Eliminates 99.9% of germs while keeping your family and environment safe." }
];

function updateHTMLText(index) {
    const data = slideData[index];
    if (!data) return;

    // Fade out text elements using GSAP
    gsap.to('.hero-gallery-text-top h1, .hero-gallery-text-top p, .active-slide-info', {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
            const heading = document.querySelector('.hero-gallery-text-top h1');
            const desc = document.querySelector('.hero-gallery-text-top p');
            const num = document.querySelector('.slide-number');
            const title = document.querySelector('.slide-title');

            if (heading) heading.innerHTML = data.text;
            if (desc) desc.textContent = data.desc;
            if (num) num.textContent = data.num;
            if (title) title.textContent = data.title;

            gsap.to('.hero-gallery-text-top h1, .hero-gallery-text-top p, .active-slide-info', {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    });

    // Update active dots
    document.querySelectorAll('.gallery-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
    });
}

// Fallback initialization boilerplate guard for canvas renders
function initHeroGallery() {
    const container = document.getElementById('hero-canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 5;
}