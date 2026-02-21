package com.shopease.controller;

import com.shopease.entity.Address;
import com.shopease.entity.User;
import com.shopease.repository.UserRepository;
import com.shopease.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/me/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Address>> getMyAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(addressService.getUserAddresses(getUser(userDetails).getId()));
    }

    @PostMapping
    public ResponseEntity<Address> createAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Address address) {
        return new ResponseEntity<>(addressService.createAddress(getUser(userDetails), address), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Address address) {
        return ResponseEntity.ok(addressService.updateAddress(getUser(userDetails), id, address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        addressService.deleteAddress(getUser(userDetails), id);
        return ResponseEntity.noContent().build();
    }
}
