package com.careconnect.repository;

import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {

    Optional<DoctorProfile> findByUser(User user);

    Optional<DoctorProfile> findByUser_UserId(Long userId);

    boolean existsByLicenseNumber(String licenseNumber);
}

