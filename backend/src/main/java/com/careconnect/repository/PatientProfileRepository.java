package com.careconnect.repository;

import com.careconnect.entity.PatientProfile;
import com.careconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {

    Optional<PatientProfile> findByUser(User user);

    Optional<PatientProfile> findByUser_UserId(Long userId);
}

