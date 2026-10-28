package com.sparknity.taskmanager.service;

import com.sparknity.taskmanager.dto.TaskRequest;
import com.sparknity.taskmanager.dto.TaskResponse;
import com.sparknity.taskmanager.entity.Task;
import com.sparknity.taskmanager.entity.TaskStatus;
import com.sparknity.taskmanager.entity.User;
import com.sparknity.taskmanager.exception.ResourceNotFoundException;
import com.sparknity.taskmanager.repository.TaskRepository;
import com.sparknity.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private User testUser;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setName("Suraj Kumar");
        testUser.setEmail("suraj@example.com");
        testUser.setPassword("encodedPassword");

        testTask = new Task();
        testTask.setTitle("Assignment Task");
        testTask.setDescription("Complete full stack project");
        testTask.setStatus(TaskStatus.TODO);
        testTask.setDueDate(LocalDate.now().plusDays(3));
        testTask.setUser(testUser);
    }

    @Test
    @DisplayName("Create task successfully for logged-in user")
    void testCreateTask_Success() {
        when(userRepository.findByEmailIgnoreCase("suraj@example.com")).thenReturn(Optional.of(testUser));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskRequest request = new TaskRequest("Assignment Task", "Complete full stack project", TaskStatus.TODO, LocalDate.now().plusDays(3));
        TaskResponse response = taskService.create("suraj@example.com", request);

        assertNotNull(response);
        assertEquals("Assignment Task", response.title());
        assertEquals(TaskStatus.TODO, response.status());
        verify(userRepository, times(1)).findByEmailIgnoreCase("suraj@example.com");
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("Create task throws ResourceNotFoundException when user does not exist")
    void testCreateTask_UserNotFound() {
        when(userRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());

        TaskRequest request = new TaskRequest("Test", "Desc", TaskStatus.TODO, null);
        assertThrows(ResourceNotFoundException.class, () -> taskService.create("unknown@example.com", request));
    }

    @Test
    @DisplayName("List tasks returns tasks ordered by creation date for user")
    void testListTasks_Success() {
        when(userRepository.findByEmailIgnoreCase("suraj@example.com")).thenReturn(Optional.of(testUser));
        when(taskRepository.findAllByUserIdOrderByCreatedAtDesc(testUser.getId())).thenReturn(List.of(testTask));

        List<TaskResponse> list = taskService.list("suraj@example.com");

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Assignment Task", list.get(0).title());
    }

    @Test
    @DisplayName("Get task by id returns task when owned by user")
    void testGetTask_Success() {
        when(userRepository.findByEmailIgnoreCase("suraj@example.com")).thenReturn(Optional.of(testUser));
        when(taskRepository.findByIdAndUserId(1L, testUser.getId())).thenReturn(Optional.of(testTask));

        TaskResponse response = taskService.get("suraj@example.com", 1L);

        assertNotNull(response);
        assertEquals("Assignment Task", response.title());
    }

    @Test
    @DisplayName("Delete task deletes task when owned by user")
    void testDeleteTask_Success() {
        when(userRepository.findByEmailIgnoreCase("suraj@example.com")).thenReturn(Optional.of(testUser));
        when(taskRepository.findByIdAndUserId(1L, testUser.getId())).thenReturn(Optional.of(testTask));

        assertDoesNotThrow(() -> taskService.delete("suraj@example.com", 1L));
        verify(taskRepository, times(1)).delete(testTask);
    }
}
