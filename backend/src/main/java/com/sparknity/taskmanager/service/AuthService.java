package com.sparknity.taskmanager.service;
import com.sparknity.taskmanager.dto.*;
import com.sparknity.taskmanager.entity.User;
import com.sparknity.taskmanager.repository.UserRepository;
import com.sparknity.taskmanager.security.JwtUtil;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service
public class AuthService {
 private final UserRepository users;private final PasswordEncoder encoder;private final AuthenticationManager manager;private final JwtUtil jwt;
 public AuthService(UserRepository u,PasswordEncoder e,AuthenticationManager m,JwtUtil j){users=u;encoder=e;manager=m;jwt=j;}
 public AuthResponse register(RegisterRequest r){
  String email=r.email().trim().toLowerCase();
  if(users.existsByEmailIgnoreCase(email))throw new IllegalArgumentException("An account with this email already exists.");
  User u=new User();u.setName(r.name().trim());u.setEmail(email);u.setPassword(encoder.encode(r.password()));u=users.save(u);
  return new AuthResponse(jwt.generate(email),"Bearer",u.getId(),u.getName(),u.getEmail());
 }
 public AuthResponse login(LoginRequest r){
  String email=r.email().trim().toLowerCase();
  try{manager.authenticate(new UsernamePasswordAuthenticationToken(email,r.password()));}
  catch(AuthenticationException ex){throw new BadCredentialsException("Invalid email or password.");}
  User u=users.findByEmailIgnoreCase(email).orElseThrow(()->new BadCredentialsException("Invalid email or password."));
  return new AuthResponse(jwt.generate(email),"Bearer",u.getId(),u.getName(),u.getEmail());
 }
}
