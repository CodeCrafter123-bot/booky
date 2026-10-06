package com.hussein.booky.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

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

    // Handles errors thrown with an explicit HTTP status, e.g.
    // new ResponseStatusException(HttpStatus.CONFLICT, "Slot already booked").
    // Without this, Spring hides the reason and the frontend gets no message.
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(
            ResponseStatusException exception) {

        String message = exception.getReason();

        if (message == null || message.isBlank()) {
            message = "Request could not be completed";
        }

        return ResponseEntity
                .status(exception.getStatusCode())
                .body(errorBody(message));
    }

    // Handles a duplicate or conflicting row rejected by the database
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataConflict(
            DataIntegrityViolationException exception) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(errorBody(
                        "This conflicts with existing data. Please check and try again."
                ));
    }

    // Handles business-rule errors thrown by the services as a plain
    // RuntimeException("message") - these are the user's mistake (400),
    // not a server failure (500).
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleBusinessRule(
            RuntimeException exception) {

        // Subclasses (NullPointerException, Spring's own request errors...)
        // are real failures or already have default handling: rethrowing
        // lets Spring process them as before, without exposing details.
        if (exception.getClass() != RuntimeException.class) {
            throw exception;
        }

        String message = exception.getMessage();

        if (message == null || message.isBlank()) {
            message = "Request could not be completed";
        }

        HttpStatus status = message.endsWith("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;

        return ResponseEntity
                .status(status)
                .body(errorBody(message));
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> error = new LinkedHashMap<>();
        error.put("message", message);

        return error;
    }
}
