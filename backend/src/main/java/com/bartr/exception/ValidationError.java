package com.bartr.exception;

import org.springframework.validation.FieldError;

import java.util.ArrayList;
import java.util.List;
public class ValidationError extends ApiError {
    private List<FieldValidationError> fieldErrors = new ArrayList<>();

    public ValidationError(String message) {
        super(org.springframework.http.HttpStatus.BAD_REQUEST, message, null);
    }

    public void addFieldError(FieldError fieldError) {
        FieldValidationError error = new FieldValidationError(
            fieldError.getField(),
            fieldError.getDefaultMessage()
        );
        fieldErrors.add(error);
    }

    private static class FieldValidationError {
        private String field;
        private String message;

        FieldValidationError(String field, String message) {
            this.field = field;
            this.message = message;
        }

        // Getters
        public String getField() { return field; }
        public String getMessage() { return message; }

        // Setters
        public void setField(String field) { this.field = field; }
        public void setMessage(String message) { this.message = message; }
    }

    // Getters and setters for ValidationError
    public List<FieldValidationError> getFieldErrors() { return fieldErrors; }
    public void setFieldErrors(List<FieldValidationError> fieldErrors) { this.fieldErrors = fieldErrors; }
}