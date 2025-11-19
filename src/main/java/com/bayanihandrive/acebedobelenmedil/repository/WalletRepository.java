package com.bayanihandrive.acebedobelenmedil.repository;

import com.bayanihandrive.acebedobelenmedil.model.Wallet; // Ensure you have this model
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserId(UUID userId);
}