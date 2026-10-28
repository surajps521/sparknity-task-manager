package com.sparknity.taskmanager.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
 private static final Logger log=LoggerFactory.getLogger(JwtAuthenticationFilter.class);
 private final JwtUtil jwt; private final UserDetailsService users;
 public JwtAuthenticationFilter(JwtUtil jwt,UserDetailsService users){this.jwt=jwt;this.users=users;}
 protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String h=req.getHeader("Authorization");
  if(h!=null&&h.startsWith("Bearer ")&&SecurityContextHolder.getContext().getAuthentication()==null){
   String token=h.substring(7);
   try{if(jwt.valid(token)){UserDetails u=users.loadUserByUsername(jwt.subject(token));var a=new UsernamePasswordAuthenticationToken(u,null,u.getAuthorities());a.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));SecurityContextHolder.getContext().setAuthentication(a);}}
   catch(RuntimeException ex){log.debug("Rejected invalid bearer token for {} {}",req.getMethod(),req.getRequestURI());}
  }
  chain.doFilter(req,res);
 }
}
