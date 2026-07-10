package com.hussein.booky.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import com.hussein.booky.exception.FrozenAccountException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationErrors(MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .get(0)
                .getDefaultMessage();

        Map<String, String> error = new LinkedHashMap<>();
        error.put("message", message);

        return error;
    }
    @ExceptionHandler(FrozenAccountException.class)
public ResponseEntity<Map<String, Object>> handleFrozenAccount(
        FrozenAccountException exception
) {
    Map<String, Object> response = new HashMap<>();

    response.put("message", "Your account has been frozen");
    response.put("reason", exception.getMessage());
    response.put("code", "ACCOUNT_FROZEN");

    return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(response);
}
}