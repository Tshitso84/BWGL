document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    let lastScrollTop = 0;

    // Scroll hide/show header
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.classList.add('hide');
        } else if (scrollTop < lastScrollTop) {
            header.classList.remove('hide');
        }
        
        lastScrollTop = scrollTop;
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
});

// CART
document.addEventListener('DOMContentLoaded', function() {
    // Find the existing cart icon in the header
    const cartIcon = document.querySelector('.nav-btns button:nth-child(1)');
    
    // Add cart counter to the icon
    const cartCounter = document.createElement('span');
    cartCounter.className = 'cart-counter';
    cartCounter.style.position = 'absolute';
    cartCounter.style.top = '-8px';
    cartCounter.style.right = '-8px';
    cartCounter.style.backgroundColor = '#e94545';
    cartCounter.style.color = 'white';
    cartCounter.style.fontSize = '12px';
    cartCounter.style.fontWeight = 'bold';
    cartCounter.style.borderRadius = '50%';
    cartCounter.style.width = '20px';
    cartCounter.style.height = '20px';
    cartCounter.style.display = 'flex';
    cartCounter.style.alignItems = 'center';
    cartCounter.style.justifyContent = 'center';
    cartCounter.textContent = '0';
    
    // Make sure cart icon has position relative for absolute positioning of counter
    if (window.getComputedStyle(cartIcon).position === 'static') {
        cartIcon.style.position = 'relative';
    }
    
    cartIcon.appendChild(cartCounter);
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    document.body.appendChild(overlay);
    
    // Add close button to cart
    const cartTitle = document.querySelector('.cart-title');
    const closeButton = document.createElement('button');
    closeButton.className = 'close-cart';
    closeButton.innerHTML = '<i class="fa-solid fa-times"></i>';
    cartTitle.appendChild(closeButton);
    
    // Get the cart element
    const cart = document.querySelector('.cart');
    
    // Store currency symbol - default to R but can be updated
    let currencySymbol = 'R';
    
    // Try to detect currency from existing price elements on the page
    const detectCurrency = () => {
        const priceElements = document.querySelectorAll('.product-price');
        if (priceElements.length > 0) {
            const firstPrice = priceElements[0].textContent.trim();
            // Extract the currency symbol (non-digit, non-space, non-period characters at the start)
            const match = firstPrice.match(/^[^\d\s.]+/);
            if (match && match[0]) {
                currencySymbol = match[0];
            }
        }
        return currencySymbol;
    };
    
    // Detect currency on page load
    currencySymbol = detectCurrency();
    
    // Function to parse price from any currency format
    function parsePrice(priceString) {
        // Remove all non-digit and non-decimal point characters
        return parseFloat(priceString.replace(/[^\d.]/g, ''));
    }
    
    // Function to format price with the current currency symbol
    function formatPrice(amount) {
        return `${currencySymbol}${amount.toFixed(2)}`;
    }
    
    // Function to open cart
    function openCart(e) {
        if (e && e.preventDefault) e.preventDefault(); // Prevent default link behavior
        cart.classList.add('open');
        document.querySelector('.cart-overlay').classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when cart is open
    }
    
    // Function to close cart
    function closeCart() {
        cart.classList.remove('open');
        document.querySelector('.cart-overlay').classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Event listeners for cart opening/closing - these elements should be consistent across pages
    cartIcon.addEventListener('click', openCart);
    closeButton.addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    
    // Initialize cart items array (from localStorage if exists)
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Function to save cart to localStorage
    function saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
    
    // Function to generate unique product ID
    function generateProductId(title) {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    
    // Function to calculate cart subtotal
    function calculateSubtotal() {
        return cartItems.reduce((total, item) => {
            return total + (item.numericPrice * item.quantity);
        }, 0);
    }
    
    // Function to update cart counter
    function updateCartCounter() {
        const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCounter.textContent = itemCount;
        
        // Show/hide counter based on item count
        if (itemCount > 0) {
            cartCounter.style.display = 'flex';
        } else {
            cartCounter.style.display = '0';
        }
    }
    
    // EVENT DELEGATION for product interactions
    // Instead of attaching events to each product card, we attach to a parent container
    const productContainer = document.querySelector('.products-container') || document.body;
    
    productContainer.addEventListener('click', function(event) {
        // Handle quantity decrease
        if (event.target.classList.contains('quantity-btn') && event.target.classList.contains('minus')) {
            const card = event.target.closest('.product-card');
            if (card) {
                const quantityDisplay = card.querySelector('.quantity-display');
                let quantity = parseInt(quantityDisplay.textContent);
                if (quantity > 1) {
                    quantity--;
                    quantityDisplay.textContent = quantity;
                }
            }
        }
        
        // Handle quantity increase
        if (event.target.classList.contains('quantity-btn') && event.target.classList.contains('plus')) {
            const card = event.target.closest('.product-card');
            if (card) {
                const quantityDisplay = card.querySelector('.quantity-display');
                let quantity = parseInt(quantityDisplay.textContent);
                quantity++;
                quantityDisplay.textContent = quantity;
            }
        }
        
        // Handle add to cart button
        if (event.target.classList.contains('add-to-cart-btn')) {
            const addToCartBtn = event.target;
            const card = addToCartBtn.closest('.product-card');
            
            if (card) {
                // Show loading state
                addToCartBtn.setAttribute('aria-busy', 'true');
                addToCartBtn.value = addToCartBtn.getAttribute('data-loading-text');
                
                // Get product details
                const productTitle = card.querySelector('.product-title h3').textContent;
                const productDetail = card.querySelector('.product-detail p').textContent;
                const productPrice = card.querySelector('.product-price').textContent.trim();
                
                // Parse price regardless of currency format
                const numericPrice = parsePrice(productPrice);
                
                const productId = generateProductId(productTitle);
                const quantityDisplay = card.querySelector('.quantity-display');
                let quantity = parseInt(quantityDisplay.textContent);
                
                // Create product object
                const product = {
                    id: productId,
                    title: productTitle,
                    detail: productDetail,
                    price: productPrice,
                    numericPrice: numericPrice,
                    quantity: quantity
                };
                
                // Check if product already exists in cart
                const existingProductIndex = cartItems.findIndex(item => item.id === productId);
                
                if (existingProductIndex !== -1) {
                    // Update quantity if product already exists
                    cartItems[existingProductIndex].quantity += quantity;
                } else {
                    // Add new product to cart
                    cartItems.push(product);
                }
                
                // Add to cart and update display
                setTimeout(() => {
                    // Save to localStorage
                    saveCart();
                    
                    // Update cart UI
                    renderCartItems();
                    
                    // Update cart counter
                    updateCartCounter();
                    
                    // Reset button state
                    addToCartBtn.setAttribute('aria-busy', 'false');
                    addToCartBtn.value = 'ADD TO CART';
                    
                    // Show success message and open cart
                    showAddedToCartMessage(productTitle);
                    openCart();
                }, 800);
            }
        }
    });
    
    // EVENT DELEGATION for cart interactions
    // Use delegation for cart product interactions
    document.querySelector('.cart-content').addEventListener('click', function(event) {
        // Handle remove button
        if (event.target.classList.contains('cart-product-btn')) {
            const productContainer = event.target.closest('.cart-product-container');
            if (productContainer) {
                // Get index from data attribute
                const index = parseInt(productContainer.getAttribute('data-product-index'));
                if (!isNaN(index)) {
                    removeCartItem(index);
                }
            }
        }
        
        // Handle quantity up arrow
        if (event.target.classList.contains('fa-arrow-up')) {
            const productContainer = event.target.closest('.cart-product-container');
            if (productContainer) {
                // Get index from data attribute
                const index = parseInt(productContainer.getAttribute('data-product-index'));
                if (!isNaN(index)) {
                    updateItemQuantity(index, 1);
                }
            }
        }
        
        // Handle quantity down arrow
        if (event.target.classList.contains('fa-arrow-down')) {
            const productContainer = event.target.closest('.cart-product-container');
            if (productContainer) {
                // Get index from data attribute
                const index = parseInt(productContainer.getAttribute('data-product-index'));
                if (!isNaN(index)) {
                    // Get current quantity
                    const quantityText = event.target.parentNode.textContent.trim();
                    const quantity = parseInt(quantityText);
                    
                    // Only decrease if quantity > 1
                    if (quantity > 1) {
                        updateItemQuantity(index, -1);
                    }
                }
            }
        }
    });
    
    // Function to render all cart items
    function renderCartItems() {
        // Get the cart content container
        const cartContent = document.querySelector('.cart-content');
        
        // Clear existing cart product info
        const existingProductInfo = cartContent.querySelector('.cart-product-info');
        if (existingProductInfo) {
            cartContent.removeChild(existingProductInfo);
        }
        
        // Create container for all products
        const cartProductsContainer = document.createElement('div');
        cartProductsContainer.className = 'cart-product-info';
        
        // If cart is empty, show message
        if (cartItems.length === 0) {
            const emptyCartMessage = document.createElement('div');
            emptyCartMessage.className = 'empty-cart-message';
            emptyCartMessage.textContent = 'Your cart is empty 😒';
            emptyCartMessage.style.padding = '1.5rem';
            emptyCartMessage.style.textAlign = 'center';
            cartProductsContainer.appendChild(emptyCartMessage);
        } else {
            // Add each product to the cart
            cartItems.forEach((item, index) => {
                const productElement = createProductElement(item, index);
                cartProductsContainer.appendChild(productElement);
            });
        }
        
        // Insert the products container before checkout section
        const checkoutSection = cartContent.querySelector('.cart-checkout');
        cartContent.insertBefore(cartProductsContainer, checkoutSection);
        
        // Update subtotal
        updateSubtotal();
    }
    
    // Function to create a product element
    function createProductElement(product, index) {
        // Create product container
        const productContainer = document.createElement('div');
        productContainer.className = 'cart-product-container';
        productContainer.setAttribute('data-product-index', index); // Store index for event delegation
        productContainer.style.marginBottom = '2rem';
        productContainer.style.borderBottom = '1px solid #1A4170';
        productContainer.style.paddingBottom = '15px';
        productContainer.style.display = 'flex';
        productContainer.style.alignItems = 'center';
        productContainer.style.justifyContent = 'space-between';
        productContainer.style.width = '100%';
        
        // Create product info element
        const productInfo = document.createElement('div');
        productInfo.className = 'cart-product';
        productInfo.style.display = 'flex';
        productInfo.style.justifyContent = 'space-between';
        productInfo.style.alignItems = 'center';
        
        // Create product title
        const productTitle = document.createElement('div');
        productTitle.className = 'cart-product-title';
        const titleH3 = document.createElement('h3');
        titleH3.textContent = product.title;
        productTitle.appendChild(titleH3);
        
        // Create product price
        const productPrice = document.createElement('div');
        productPrice.className = 'cart-product-price';
        const priceP = document.createElement('p');
        // Format price with current currency symbol
        priceP.textContent = formatPrice(product.numericPrice * product.quantity);
        productPrice.appendChild(priceP);
        
        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.className = 'cart-product-btn';
        removeButton.textContent = 'Remove';
        
        // Add elements to product info
        productInfo.appendChild(productTitle);
        productInfo.appendChild(productPrice);
        productInfo.appendChild(removeButton);
        
        // Create quantity controls
        const quantityControls = document.createElement('div');
        quantityControls.className = 'cart-product-arrows';
        const quantitySpan = document.createElement('span');
        
        // Add up arrow
        const upArrow = document.createElement('i');
        upArrow.className = 'fa-solid fa-arrow-up';
        
        // Add quantity text
        const quantityText = document.createTextNode(` ${product.quantity} `);
        
        // Add down arrow
        const downArrow = document.createElement('i');
        downArrow.className = 'fa-solid fa-arrow-down';
        
        // Add elements to quantity span
        quantitySpan.appendChild(upArrow);
        quantitySpan.appendChild(quantityText);
        quantitySpan.appendChild(downArrow);
        quantityControls.appendChild(quantitySpan);
        
        // Add all elements to container
        productContainer.appendChild(productInfo);
        productContainer.appendChild(quantityControls);
        
        return productContainer;
    }
    
    // Function to update item quantity
    function updateItemQuantity(index, change) {
        cartItems[index].quantity += change;
        saveCart();
        renderCartItems();
        updateCartCounter();
    }
    
    // Function to remove item from cart
    function removeCartItem(index) {
        cartItems.splice(index, 1);
        saveCart();
        renderCartItems();
        updateCartCounter();
    }
    
    // Function to update subtotal
    function updateSubtotal() {
        const subtotal = calculateSubtotal();
        const subtotalElement = document.querySelector('.total');
        subtotalElement.textContent = formatPrice(subtotal);
    }
    
    // Show added to cart message
    function showAddedToCartMessage(productTitle) {
        // Create message element
        const message = document.createElement('div');
        message.className = 'added-to-cart-message';
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.right = '20px';
        message.style.backgroundColor = '#4CAF50';
        message.style.color = 'white';
        message.style.padding = '12px 20px';
        message.style.borderRadius = '4px';
        message.style.zIndex = '1000';
        message.style.opacity = '0';
        message.style.transition = 'opacity 0.3s ease';
        message.textContent = `${productTitle} added to cart 😍`;
        
        // Add to DOM
        document.body.appendChild(message);
        
        // Show message
        setTimeout(() => {
            message.style.opacity = '1';
        }, 10);
        
        // Remove message after 2 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 2000);
    }
    
    // Initialize cart checkout button with event delegation
    document.querySelector('.cart-content').addEventListener('click', function(event) {
        if (event.target.classList.contains('cart-checkout-btn')) {
            alert('Proceeding to checkout with ' + cartItems.length + ' items totaling ' + formatPrice(calculateSubtotal()));
            // Add your checkout logic here
        }
    });
    
    // Keyboard accessibility - close cart with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && cart.classList.contains('open')) {
            closeCart();
        }
    });
    
    // Fix for nested link in button using event delegation
    if (cartIcon.querySelector('a')) {
        cartIcon.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link) {
                e.preventDefault(); // Prevent the link from navigating
            }
        });
    }
    
    // Initialize cart on page load
    renderCartItems();
    updateCartCounter();
});

// CHECKOUT

document.addEventListener('DOMContentLoaded', function() {
    // Function to get cart items from localStorage
    function getCartItems() {
        return JSON.parse(localStorage.getItem('cartItems')) || [];
    }
    
    // Get currency symbol from existing function (assumed to be in cart.js)
    let currencySymbol = 'R'; // Default
    
    // Function to format price (equivalent to the one in cart.js)
    function formatPrice(amount) {
        return `${currencySymbol}${amount.toFixed(2)}`;
    }
    
    // Populate the checkout cart items
    function populateCheckoutItems() {
        const cartItems = getCartItems();
        const checkoutCartItems = document.getElementById('checkout-cart-items');
        
        // Clear existing items
        checkoutCartItems.innerHTML = '';
        
        if (cartItems.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Your cart is empty. Please add items before checkout.';
            checkoutCartItems.appendChild(emptyMessage);
            
            // Disable checkout button
            document.getElementById('place-order-btn').disabled = true;
            
            return;
        }
        
        // Enable checkout button
        document.getElementById('place-order-btn').disabled = false;
        
        // Add each cart item to the checkout summary
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
        
        // Calculate and update order totals
        updateOrderTotals();
    }
    
    // Calculate and update order totals
    function updateOrderTotals() {
        const cartItems = getCartItems();
        
        // Calculate subtotal
        const subtotal = cartItems.reduce((total, item) => {
            return total + (item.numericPrice * item.quantity);
        }, 0);
        
        // Set shipping cost
        const shipping = 50; // Fixed shipping cost
        
        // Calculate tax (15%)
        const tax = subtotal * 0.15;
        
        // Calculate total
        const total = subtotal + shipping + tax;
        
        // Update the display
        document.getElementById('checkout-subtotal').textContent = formatPrice(subtotal);
        document.getElementById('checkout-shipping').textContent = formatPrice(shipping);
        document.getElementById('checkout-tax').textContent = formatPrice(tax);
        document.getElementById('checkout-total').textContent = formatPrice(total);
    }
    
    // Handle place order button
    document.getElementById('place-order-btn').addEventListener('click', function(e) {
        e.preventDefault();
        
        const orderBtn = this;
        orderBtn.setAttribute('aria-busy', 'true');
        orderBtn.textContent = orderBtn.getAttribute('data-loading-text');
        
        // Validate the form
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
        
        // Simulate order processing
        setTimeout(() => {
            // Clear cart after successful order
            localStorage.removeItem('cartItems');
            
            // Show success message and redirect
            alert('Order placed successfully! Thank you for your purchase.');
            
            // Reset button state
            orderBtn.setAttribute('aria-busy', 'false');
            orderBtn.textContent = 'Place Order';
            
            // Redirect to confirmation page (in a real app)
            // window.location.href = 'order-confirmation.html';
            
            // For demo: reload the page
            window.location.reload();
        }, 2000);
    });
    
    // Link the cart checkout button to the checkout page
    document.querySelector('.cart-checkout-btn').addEventListener('click', function() {
        // In a real app, you might want to navigate to checkout.html instead
        // For this demo, we're already on the checkout page
        // Close the cart if open
        const cart = document.querySelector('.cart');
        if (cart.classList.contains('open')) {
            cart.classList.remove('open');
            document.querySelector('.cart-overlay').classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Scroll to checkout form
        document.querySelector('.checkout-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });
    
    // Initialize checkout page
    populateCheckoutItems();
});