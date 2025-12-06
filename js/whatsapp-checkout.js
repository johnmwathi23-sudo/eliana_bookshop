/**
 * ELIANA BOOKSHOP - WhatsApp Checkout Integration
 * Handles cart management and WhatsApp order forwarding
 */

(function () {
    'use strict';

    const WHATSAPP_NUMBER = '254714075118'; // Eliana Bookshop WhatsApp

    // Cart storage
    let cart = JSON.parse(localStorage.getItem('elianaCart')) || [];

    // Initialize cart display
    function initCart() {
        updateCartDisplay();
        updateCartCount();
    }

    // Add item to cart
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        saveCart();
        updateCartDisplay();
        updateCartCount();
        showNotification('Item added to cart!');
    }

    // Remove item from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartDisplay();
        updateCartCount();
    }

    // Update quantity
    function updateQuantity(productId, quantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
                updateCartDisplay();
                updateCartCount();
            }
        }
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('elianaCart', JSON.stringify(cart));
    }

    // Update cart count in header
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count, .text-number');
        cartCountElements.forEach(el => {
            el.textContent = count;
        });
    }

    // Update cart display
    function updateCartDisplay() {
        const cartContainer = document.getElementById('cart-items-container');
        if (!cartContainer) return;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p class="text-center py-4">Your cart is empty</p>';
            updateCartTotal();
            return;
        }

        let html = '';
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            html += `
                <tr class="cart-item" data-product-id="${item.id}">
                    <td class="product-remove">
                        <a href="#" class="remove-item" data-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </a>
                    </td>
                    <td class="product-name">
                        ${item.name}
                    </td>
                    <td class="product-price">
                        <span class="price">KSh ${item.price.toLocaleString()}</span>
                    </td>
                    <td class="product-quantity">
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    </td>
                    <td class="product-subtotal">
                        <span class="price">KSh ${subtotal.toLocaleString()}</span>
                    </td>
                </tr>
            `;
        });

        cartContainer.innerHTML = html;

        // Attach event listeners
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                removeFromCart(this.dataset.id);
            });
        });

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function () {
                updateQuantity(this.dataset.id, this.value);
            });
        });

        updateCartTotal();
    }

    // Calculate and update cart total
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElements = document.querySelectorAll('.cart-total-price, .grand-total');
        totalElements.forEach(el => {
            el.textContent = `KSh ${total.toLocaleString()}`;
        });
    }

    // Generate WhatsApp message
    function generateWhatsAppMessage() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return null;
        }

        let message = 'Hello Eliana Bookshop, I want to complete my order.%0A%0A';
        message += '*MY ORDER:*%0A';
        message += '━━━━━━━━━━━━━━━━%0A';

        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name}%0A`;
            message += `   Qty: ${item.quantity} × KSh ${item.price.toLocaleString()}%0A`;
            message += `   Subtotal: KSh ${(item.price * item.quantity).toLocaleString()}%0A%0A`;
        });

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += '━━━━━━━━━━━━━━━━%0A';
        message += `*TOTAL: KSh ${total.toLocaleString()}*%0A%0A`;
        message += 'Please send me the M-Pesa Till Number for payment.%0A%0A';
        message += 'Delivery Location: Nakuru Town%0A';
        message += 'Thank you!';

        return message;
    }

    // WhatsApp checkout function
    function proceedToWhatsAppCheckout() {
        const message = generateWhatsAppMessage();
        if (!message) return;

        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
        window.open(whatsappURL, '_blank');

        // Optional: Clear cart after checkout
        // cart = [];
        // saveCart();
        // updateCartDisplay();
        // updateCartCount();
    }

    // Quick WhatsApp inquiry for a product
    function quickWhatsAppInquiry(productName, productPrice) {
        const message = `Hello Eliana Bookshop,%0A%0AI'm interested in:%0A*${productName}*%0APrice: KSh ${productPrice}%0A%0AIs this available?`;
        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
        window.open(whatsappURL, '_blank');
    }

    // Show notification
    function showNotification(message) {
        // Simple alert - can be upgraded to toast notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#28a745;color:white;padding:15px 25px;border-radius:4px;z-index:9999;box-shadow:0 2px 5px rgba(0,0,0,0.2);';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function () {
        initCart();

        // Checkout button click handler
        const checkoutBtns = document.querySelectorAll('.whatsapp-checkout-btn, .checkout-btn');
        checkoutBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                proceedToWhatsAppCheckout();
            });
        });

        // Add to cart button handlers
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const product = {
                    id: this.dataset.productId,
                    name: this.dataset.productName,
                    price: parseFloat(this.dataset.productPrice)
                };
                addToCart(product);
            });
        });

        // Quick WhatsApp buttons
        document.querySelectorAll('.quick-whatsapp-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                quickWhatsAppInquiry(this.dataset.productName, this.dataset.productPrice);
            });
        });
    });

    // Export functions to global scope for inline handlers
    window.ElianaCart = {
        addToCart: addToCart,
        removeFromCart: removeFromCart,
        updateQuantity: updateQuantity,
        proceedToWhatsAppCheckout: proceedToWhatsAppCheckout,
        quickWhatsAppInquiry: quickWhatsAppInquiry
    };

})();
