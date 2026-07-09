package com.hussein.booky.service;

import com.hussein.booky.dto.LoginRequest;
import com.hussein.booky.dto.LoginResponse;
import com.hussein.booky.dto.RegisterRequest;
import com.hussein.booky.dto.UpdateProfileRequest;
import com.hussein.booky.dto.UserResponse;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.UserRepository;
import com.hussein.booky.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.hussein.booky.dto.AdminUpdateUserRequest;
import java.util.List;
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public UserResponse register(RegisterRequest request) {
        String encryptedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                encryptedPassword,
                request.getPhone(),
                request.getRole()
        );

        User savedUser = userRepository.save(user);

        return toUserResponse(savedUser);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail());

        if (user == null) {
            return null;
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            return null;
        }

        UserResponse userResponse = toUserResponse(user);

        String token = jwtService.generateToken(user);

        return new LoginResponse(token, userResponse);
    }

    public UserResponse updateProfile(Integer userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User existingEmailUser = userRepository.findByEmail(request.getEmail());

        if (existingEmailUser != null && !existingEmailUser.getId().equals(userId)) {
            throw new RuntimeException("Email is already used by another account");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        User savedUser = userRepository.save(user);

        return toUserResponse(savedUser);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );
    }
    public List<UserResponse> getAllUsersForAdmin() {
    return userRepository.findAll()
            .stream()
            .map(this::toUserResponse)
            .toList();
}

public UserResponse getUserByIdForAdmin(Integer userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return toUserResponse(user);
}

public UserResponse updateUserForAdmin(Integer userId, AdminUpdateUserRequest request) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    User existingEmailUser = userRepository.findByEmail(request.getEmail());

    if (existingEmailUser != null && !existingEmailUser.getId().equals(userId)) {
        throw new RuntimeException("Email is already used by another account");
    }

    String role = request.getRole().toUpperCase();

    if (!role.equals("CLIENT") && !role.equals("OWNER") && !role.equals("ADMIN")) {
        throw new RuntimeException("Invalid role. Role must be CLIENT, OWNER, or ADMIN");
    }

    user.setFullName(request.getFullName());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhone());
    user.setRole(role);

    User savedUser = userRepository.save(user);

    return toUserResponse(savedUser);
}
}