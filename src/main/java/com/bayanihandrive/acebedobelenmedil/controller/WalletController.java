package com.bayanihandrive.acebedobelenmedil.controller;

import com.bayanihandrive.acebedobelenmedil.model.Wallet;
import com.bayanihandrive.acebedobelenmedil.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "http://localhost:3000")
public class WalletController {

    private final WalletService walletService;

    @Autowired
    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping("/add-funds")
    public ResponseEntity<Wallet> addFunds(
            @RequestBody Map<String, BigDecimal> payload,
            @AuthenticationPrincipal Jwt jwt) {
        
        String userId = jwt.getSubject();
        BigDecimal amount = payload.get("amount");
        
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
             return ResponseEntity.badRequest().build();
        }

        Wallet updatedWallet = walletService.addFunds(userId, amount);
        return ResponseEntity.ok(updatedWallet);
    }
}