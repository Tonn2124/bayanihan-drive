package com.bayanihandrive.acebedobelenmedil.service;

import com.bayanihandrive.acebedobelenmedil.dto.WithdrawalRequest;
import com.bayanihandrive.acebedobelenmedil.model.Withdrawal;
import com.bayanihandrive.acebedobelenmedil.model.WithdrawalStatus;
import com.bayanihandrive.acebedobelenmedil.repository.WithdrawalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class WithdrawalService {

    private final WithdrawalRepository withdrawalRepository;

    @Autowired
    public WithdrawalService(WithdrawalRepository withdrawalRepository) {
        this.withdrawalRepository = withdrawalRepository;
    }

    @Transactional
    public Withdrawal createRequest(WithdrawalRequest request, String organizerId) {
        // Logic for checking balance is handled by Database Trigger for safety,
        // but we could also add a check here if we injected CampaignService.
        
        Withdrawal withdrawal = new Withdrawal();
        withdrawal.setOrganizerId(UUID.fromString(organizerId));
        withdrawal.setCampaignId(request.campaignId());
        withdrawal.setAmount(request.amount());
        withdrawal.setPaymentMethod(request.paymentMethod());
        withdrawal.setAccountDetails(request.accountDetails());
        withdrawal.setStatus(WithdrawalStatus.PENDING); // Default status

        return withdrawalRepository.save(withdrawal);
    }

    public List<Withdrawal> getWithdrawalsByOrganizer(String organizerId) {
        return withdrawalRepository.findByOrganizerIdOrderByCreatedAtDesc(UUID.fromString(organizerId));
    }
}