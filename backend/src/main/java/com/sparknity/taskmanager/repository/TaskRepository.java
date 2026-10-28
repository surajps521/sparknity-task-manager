package com.sparknity.taskmanager.repository;
import com.sparknity.taskmanager.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface TaskRepository extends JpaRepository<Task,Long> {
 List<Task> findAllByUserIdOrderByCreatedAtDesc(Long userId);
 Optional<Task> findByIdAndUserId(Long id,Long userId);
}
