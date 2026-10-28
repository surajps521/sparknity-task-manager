package com.sparknity.taskmanager.dto;
import jakarta.validation.constraints.*;
public record LoginRequest(@NotBlank @Email String email,@NotBlank String password) {}
