package com.hussein.booky.service;

import com.hussein.booky.dto.OwnerDashboardResponse;

public interface OwnerDashboardService {

    OwnerDashboardResponse getDashboard(Integer ownerId);
}