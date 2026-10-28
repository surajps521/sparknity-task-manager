package com.sparknity.taskmanager.dto;
import com.sparknity.taskmanager.entity.*;
import java.time.*;
public record TaskResponse(Long id,String title,String description,TaskStatus status,LocalDate dueDate,LocalDateTime createdAt) {
 public static TaskResponse from(Task t){return new TaskResponse(t.getId(),t.getTitle(),t.getDescription(),t.getStatus(),t.getDueDate(),t.getCreatedAt());}
}
