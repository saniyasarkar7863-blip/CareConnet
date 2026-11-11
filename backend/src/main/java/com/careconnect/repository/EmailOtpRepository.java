package com.careconnect.repository;

import com.careconnect.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    Optional<EmailOtp> findFirstByEmailAndIsConsumedOrderByCreatedAtDesc(String email, Integer isConsumed);

    List<EmailOtp> findAllByEmailAndIsConsumed(String email, Integer isConsumed);
}
