package com.bayanihandrive.acebedobelenmedil.service;

import com.bayanihandrive.acebedobelenmedil.model.Wallet;
import com.bayanihandrive.acebedobelenmedil.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class WalletService {

    private final WalletRepository walletRepository;

    @Autowired
    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Transactional
    public Wallet addFunds(String userId, BigDecimal amount) {
        UUID uuid = UUID.fromString(userId);
        Wallet wallet = walletRepository.findByUserId(uuid)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user"));

        wallet.setBalance(wallet.getBalance().add(amount));
        return walletRepository.save(wallet);
    }
}