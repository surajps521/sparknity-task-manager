package com.sparknity.taskmanager.exception;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import java.time.Instant;
import java.util.*;
@RestControllerAdvice
public class GlobalExceptionHandler {
 @ExceptionHandler(ResourceNotFoundException.class) ResponseEntity<?> notFound(ResourceNotFoundException e){return error(404,"Not Found",e.getMessage());}
 @ExceptionHandler(NoSuchElementException.class) ResponseEntity<?> missing(NoSuchElementException e){return error(404,"Not Found",e.getMessage());}
 @ExceptionHandler(BadCredentialsException.class) ResponseEntity<?> badAuth(BadCredentialsException e){return error(401,"Unauthorized","Invalid email or password.");}
 @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<?> bad(IllegalArgumentException e){return error(400,"Bad Request",e.getMessage());}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> conflict(DataIntegrityViolationException e){return error(409,"Conflict","The request conflicts with existing data.");}
 @ExceptionHandler(HttpMessageNotReadableException.class) ResponseEntity<?> malformed(HttpMessageNotReadableException e){return error(400,"Bad Request","Request body contains invalid values.");}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException e){
  Map<String,String> fields=new LinkedHashMap<>();e.getBindingResult().getFieldErrors().forEach(x->fields.putIfAbsent(x.getField(),x.getDefaultMessage()));
  return ResponseEntity.badRequest().body(Map.of("timestamp",Instant.now(),"status",400,"error","Bad Request","message","Validation failed","validationErrors",fields));
 }
 private ResponseEntity<?> error(int status,String name,String message){return ResponseEntity.status(status).body(Map.of("timestamp",Instant.now(),"status",status,"error",name,"message",message));}
}
