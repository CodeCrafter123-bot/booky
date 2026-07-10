package com.hussein.booky.exception;

public class FrozenAccountException extends RuntimeException {

    public FrozenAccountException(String reason) {
        super(reason);
    }
}