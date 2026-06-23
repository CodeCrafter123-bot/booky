package com.hussein.booky.service;

import com.hussein.booky.dto.LoginRequest;
import com.hussein.booky.dto.LoginResponse;
import com.hussein.booky.dto.RegisterRequest;
import com.hussein.booky.dto.UserResponse;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.UserRepository;
import com.hussein.booky.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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

        return new UserResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole()
        );
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

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );

        System.out.println("USER FOUND: " + user.getEmail());

String token = jwtService.generateToken(user);

System.out.println("TOKEN: " + token);

return new LoginResponse(token, userResponse);
    }
}