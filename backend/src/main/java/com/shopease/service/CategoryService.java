package com.shopease.service;

import com.shopease.entity.Category;
import com.shopease.exception.BadRequestException;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findByParentIsNull();
    }

    @Transactional(readOnly = true)
    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @Transactional
    public Category createCategory(Category category) {
        if (categoryRepository.existsBySlug(category.getSlug())) {
            throw new BadRequestException("Slug already exists");
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id);

        if (!category.getSlug().equals(categoryDetails.getSlug()) &&
                categoryRepository.existsBySlug(categoryDetails.getSlug())) {
            throw new BadRequestException("Slug already exists");
        }

        category.setName(categoryDetails.getName());
        category.setSlug(categoryDetails.getSlug());
        category.setDescription(categoryDetails.getDescription());
        category.setImageUrl(categoryDetails.getImageUrl());

        if (categoryDetails.getParent() != null && categoryDetails.getParent().getId() != null) {
            Category parent = getCategoryById(categoryDetails.getParent().getId());
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
