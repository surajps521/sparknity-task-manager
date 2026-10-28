package com.sparknity.taskmanager.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="tasks", indexes=@Index(name="idx_tasks_user_created_at", columnList="user_id,created_at"))
public class Task {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=160) private String title;
 @Column(length=2000) private String description;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private TaskStatus status=TaskStatus.TODO;
 @Column(name="due_date") private LocalDate dueDate;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
 @Column(name="created_at",nullable=false,updatable=false) private LocalDateTime createdAt;
 @PrePersist void created(){createdAt=LocalDateTime.now();}
 public Long getId(){return id;} public String getTitle(){return title;} public void setTitle(String v){title=v;}
 public String getDescription(){return description;} public void setDescription(String v){description=v;}
 public TaskStatus getStatus(){return status;} public void setStatus(TaskStatus v){status=v;}
 public LocalDate getDueDate(){return dueDate;} public void setDueDate(LocalDate v){dueDate=v;}
 public User getUser(){return user;} public void setUser(User v){user=v;} public LocalDateTime getCreatedAt(){return createdAt;}
}
