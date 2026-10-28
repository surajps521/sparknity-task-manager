package com.sparknity.taskmanager.service;
import com.sparknity.taskmanager.dto.*;
import com.sparknity.taskmanager.entity.*;
import com.sparknity.taskmanager.exception.ResourceNotFoundException;
import com.sparknity.taskmanager.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service
public class TaskService {
 private final TaskRepository tasks;private final UserRepository users;
 public TaskService(TaskRepository t,UserRepository u){tasks=t;users=u;}
 private User user(String email){return users.findByEmailIgnoreCase(email).orElseThrow(()->new ResourceNotFoundException("User not found"));}
 private Task owned(Long id,Long uid){return tasks.findByIdAndUserId(id,uid).orElseThrow(()->new ResourceNotFoundException("Task not found"));}
 private void apply(Task t,TaskRequest r){t.setTitle(r.title().trim());t.setDescription(r.description()==null?"":r.description().trim());t.setStatus(r.status()==null?(t.getStatus()==null?TaskStatus.TODO:t.getStatus()):r.status());t.setDueDate(r.dueDate());}
 @Transactional public TaskResponse create(String email,TaskRequest r){Task t=new Task();apply(t,r);t.setUser(user(email));return TaskResponse.from(tasks.save(t));}
 @Transactional(readOnly=true) public List<TaskResponse> list(String email){return tasks.findAllByUserIdOrderByCreatedAtDesc(user(email).getId()).stream().map(TaskResponse::from).toList();}
 @Transactional(readOnly=true) public TaskResponse get(String email,Long id){return TaskResponse.from(owned(id,user(email).getId()));}
 @Transactional public TaskResponse update(String email,Long id,TaskRequest r){Task t=owned(id,user(email).getId());apply(t,r);return TaskResponse.from(tasks.save(t));}
 @Transactional public void delete(String email,Long id){tasks.delete(owned(id,user(email).getId()));}
}
