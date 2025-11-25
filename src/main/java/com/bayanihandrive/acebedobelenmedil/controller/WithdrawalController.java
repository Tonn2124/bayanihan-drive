package com.bayanihandrive.acebedobelenmedil.controller;

import com.bayanihandrive.acebedobelenmedil.dto.WithdrawalRequest;
import com.bayanihandrive.acebedobelenmedil.model.Withdrawal;
import com.bayanihandrive.acebedobelenmedil.service.WithdrawalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/withdrawals")
@CrossOrigin(origins = "http://localhost:3000")
public class WithdrawalController {

    private final WithdrawalService withdrawalService;

    @Autowired
    public WithdrawalController(WithdrawalService withdrawalService) {
        this.withdrawalService = withdrawalService;
    }

    @PostMapping
    public ResponseEntity<Withdrawal> requestWithdrawal(
            @Valid @RequestBody WithdrawalRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        String organizerId = jwt.getSubject();
        Withdrawal withdrawal = withdrawalService.createRequest(request, organizerId);
        return ResponseEntity.ok(withdrawal);
    }

    @GetMapping("/my-withdrawals")
    public ResponseEntity<List<Withdrawal>> getMyWithdrawals(@AuthenticationPrincipal Jwt jwt) {
        String organizerId = jwt.getSubject();
        return ResponseEntity.ok(withdrawalService.getWithdrawalsByOrganizer(organizerId));
    }
}