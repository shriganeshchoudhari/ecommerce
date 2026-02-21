package com.shopease.service;

import com.shopease.entity.Product;
import com.shopease.entity.User;
import com.shopease.entity.WishlistItem;
import com.shopease.exception.BadRequestException;
import com.shopease.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<WishlistItem> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    @Transactional
    public WishlistItem addToWishlist(User user, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new BadRequestException("Product already in wishlist");
        }

        Product product = productService.getProductById(productId);

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);

        return wishlistRepository.save(item);
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }
}
