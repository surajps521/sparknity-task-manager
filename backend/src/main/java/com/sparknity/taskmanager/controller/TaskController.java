package com.sparknity.taskmanager.controller;
import com.sparknity.taskmanager.dto.*;
import com.sparknity.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/tasks")
public class TaskController {
 private final TaskService service;public TaskController(TaskService s){service=s;}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public TaskResponse create(Authentication a,@Valid @RequestBody TaskRequest r){return service.create(a.getName(),r);}
 @GetMapping public List<TaskResponse> list(Authentication a){return service.list(a.getName());}
 @GetMapping("/{id}") public TaskResponse get(Authentication a,@PathVariable Long id){return service.get(a.getName(),id);}
 @PutMapping("/{id}") public TaskResponse update(Authentication a,@PathVariable Long id,@Valid @RequestBody TaskRequest r){return service.update(a.getName(),id,r);}
 @DeleteMapping("/{id}") public Map<String,String> delete(Authentication a,@PathVariable Long id){service.delete(a.getName(),id);return Map.of("message","Task deleted successfully.");}
}
