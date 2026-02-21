package com.shopease.service;

import com.shopease.entity.Cart;
import com.shopease.entity.CartItem;
import com.shopease.entity.Product;
import com.shopease.entity.User;
import com.shopease.exception.BadRequestException;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));
    }

    @Transactional
    public Cart addItemToCart(User user, Long productId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Cart cart = getCartByUserId(user.getId());
        Product product = productService.getProductById(productId);

        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Not enough stock available");
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            if (product.getStockQuantity() < item.getQuantity() + quantity) {
                throw new BadRequestException("Not enough stock available for total quantity");
            }
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cart.getItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItemQuantity(User user, Long cartItemId, int quantity) {
        Cart cart = getCartByUserId(user.getId());

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        if (quantity == 0) {
            cart.getItems().remove(item);
        } else {
            if (item.getProduct().getStockQuantity() < quantity) {
                throw new BadRequestException("Not enough stock available");
            }
            item.setQuantity(quantity);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItemFromCart(User user, Long cartItemId) {
        Cart cart = getCartByUserId(user.getId());
        cart.getItems().removeIf(item -> item.getId().equals(cartItemId));
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart clearCart(User user) {
        Cart cart = getCartByUserId(user.getId());
        cart.getItems().clear();
        return cartRepository.save(cart);
    }
}
