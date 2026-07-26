package com.hussein.booky.exception;
/*
Custom exception used when a frozen user tries to log in
  or access a protected Booky operation. */
public class FrozenAccountException extends RuntimeException {


     /*
         * Passes the reason to RuntimeException.
         *
         * The message can later be retrieved using:
         * exception.getMessage()
         */
    public FrozenAccountException(String reason) {
        super(reason);
    }
}