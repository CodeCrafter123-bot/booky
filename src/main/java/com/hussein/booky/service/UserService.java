package com.hussein.booky.service;

import com.hussein.booky.dto.LoginRequest;
import com.hussein.booky.dto.RegisterRequest;
import com.hussein.booky.dto.UserResponse;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserResponse register(RegisterRequest request) {
        User user = new User(
                request.getFullName(),
                request.getEmail(),
                request.getPassword(),
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

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndPassword(
                request.getEmail(),
                request.getPassword()
        );

        if (user == null) {
            return null;
        }

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );
    }
}