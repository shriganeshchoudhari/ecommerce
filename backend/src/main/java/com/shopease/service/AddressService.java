package com.shopease.service;

import com.shopease.entity.Address;
import com.shopease.entity.User;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    @Transactional(readOnly = true)
    public List<Address> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Address getAddressByIdAndUser(Long id, Long userId) {
        return addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
    }

    @Transactional
    public Address createAddress(User user, Address addressDetails) {
        if (addressDetails.isDefault()) {
            // Remove previous default
            List<Address> addresses = getUserAddresses(user.getId());
            addresses.forEach(a -> {
                if (a.isDefault()) {
                    a.setDefault(false);
                    addressRepository.save(a);
                }
            });
        }

        addressDetails.setUser(user);
        return addressRepository.save(addressDetails);
    }

    @Transactional
    public Address updateAddress(User user, Long id, Address addressDetails) {
        Address existingAddress = getAddressByIdAndUser(id, user.getId());

        if (addressDetails.isDefault() && !existingAddress.isDefault()) {
            // Remove previous default
            List<Address> addresses = getUserAddresses(user.getId());
            addresses.forEach(a -> {
                if (a.isDefault()) {
                    a.setDefault(false);
                    addressRepository.save(a);
                }
            });
        }

        existingAddress.setFullName(addressDetails.getFullName());
        existingAddress.setPhone(addressDetails.getPhone());
        existingAddress.setLine1(addressDetails.getLine1());
        existingAddress.setLine2(addressDetails.getLine2());
        existingAddress.setCity(addressDetails.getCity());
        existingAddress.setState(addressDetails.getState());
        existingAddress.setPincode(addressDetails.getPincode());
        existingAddress.setCountry(addressDetails.getCountry());
        existingAddress.setDefault(addressDetails.isDefault());

        return addressRepository.save(existingAddress);
    }

    @Transactional
    public void deleteAddress(User user, Long id) {
        Address address = getAddressByIdAndUser(id, user.getId());
        addressRepository.delete(address);
    }
}
