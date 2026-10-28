package com.sparknity.taskmanager.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="users")
public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=100) private String name;
 @Column(nullable=false,unique=true,length=180) private String email;
 @Column(nullable=false) private String password;
 @Column(name="created_at",nullable=false,updatable=false) private LocalDateTime createdAt;
 @OneToMany(mappedBy="user", cascade=CascadeType.ALL, orphanRemoval=true)
 private java.util.List<Task> tasks = new java.util.ArrayList<>();
 @PrePersist void created(){createdAt=LocalDateTime.now();}
 public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;}
 public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public String getPassword(){return password;} public void setPassword(String v){password=v;}
 public LocalDateTime getCreatedAt(){return createdAt;}
 public java.util.List<Task> getTasks(){return tasks;} public void setTasks(java.util.List<Task> v){tasks=v;}
}
