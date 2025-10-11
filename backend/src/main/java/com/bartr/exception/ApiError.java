package com.bartr.exception;

import org.springframework.http.HttpStatus;
public class ApiError {
    private HttpStatus status;
    private String message;
    private String debugMessage;

    public ApiError(HttpStatus status, String message, Throwable ex) {
        this.status = status;
        this.message = message;
        this.debugMessage = ex.getLocalizedMessage();
    }

    // Getters
    public HttpStatus getStatus() { return status; }
    public String getMessage() { return message; }
    public String getDebugMessage() { return debugMessage; }

    // Setters
    public void setStatus(HttpStatus status) { this.status = status; }
    public void setMessage(String message) { this.message = message; }
    public void setDebugMessage(String debugMessage) { this.debugMessage = debugMessage; }
}