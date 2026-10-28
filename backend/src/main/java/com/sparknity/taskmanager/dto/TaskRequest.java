package com.sparknity.taskmanager.dto;
import com.sparknity.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public record TaskRequest(@NotBlank @Size(max=160) String title,@Size(max=2000) String description,TaskStatus status,LocalDate dueDate) {}
