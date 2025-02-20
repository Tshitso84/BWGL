
// Sample product data (can be fetched from products.json)
const products = [
    { id: 1, name: "Eco Dish Soap", price: 5.99, image: "images/dish-soap.jpg" },
    { id: 2, name: "Green Laundry Detergent", price: 12.99, image: "images/laundry-detergent.jpg" },
    { id: 3, name: "Natural All-Purpose Cleaner", price: 8.99, image: "images/all-purpose-cleaner.jpg" }
];

let cart = [];

// Render products
const productList = document.querySelector('.product-list');
products.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>$${product.price.toFixed(2)}</p>
        <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productList.appendChild(productDiv);
});

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    updateCart();
}

// Update cart UI
function updateCart() {
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${item.name}</span>
            <span>$${item.price.toFixed(2)}</span>
        `;
        cartItems.appendChild(cartItem);
        total += item.price;
    });

    cartTotal.textContent = total.toFixed(2);
}

// Checkout button
document.getElementById('checkout-btn').addEventListener('click', () => {
    document.getElementById('products').style.display = 'none';
    document.getElementById('cart').style.display = 'none';
    document.getElementById('checkout').style.display = 'block';
});

// Checkout form submission
document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulate payment gateway integration
    setTimeout(() => {
        document.getElementById('checkout').style.display = 'none';
        document.getElementById('payment-success').style.display = 'block';
        cart = []; // Clear cart
        updateCart();
    }, 2000);
});
