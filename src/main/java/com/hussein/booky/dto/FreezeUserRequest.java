package com.hussein.booky.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FreezeUserRequest {

    @NotBlank(message = "Freeze reason is required")
    @Size(max = 500, message = "Freeze reason cannot exceed 500 characters")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}