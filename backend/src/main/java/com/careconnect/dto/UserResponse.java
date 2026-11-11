package com.careconnect.dto;

import com.careconnect.entity.DoctorVerificationStatus;
import com.careconnect.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long userId;
    private String email;
    private String fullName;
    private Role role;
    private String phone;
    private boolean emailVerified;
    private DoctorVerificationStatus doctorVerificationStatus;
    private String specialization;
    private String licenseNumber;
}

