package com.hussein.booky.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles DTO validation errors caused by @Valid
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationErrors(
            MethodArgumentNotValidException exception) {

        // Retrieves the first validation error message
        String message = exception
                .getBindingResult()
                .getFieldErrors()
                .get(0)
                .getDefaultMessage();

        // Creates the JSON error response
        Map<String, String> error = new LinkedHashMap<>();
        error.put("message", message);

        return error;
    }

    // Handles requests made by frozen accounts
    @ExceptionHandler(FrozenAccountException.class)
    public ResponseEntity<Map<String, Object>> handleFrozenAccount(
            FrozenAccountException exception) {

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Your account has been frozen");

        // The reason was passed to super(reason) in FrozenAccountException
        response.put("reason", exception.getMessage());

        // Stable code that the frontend can check
        response.put("code", "ACCOUNT_FROZEN");

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }
}