package com.financeiro.planilha_financeira.security;

import com.financeiro.planilha_financeira.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        var token = recuperarToken(request);

        if (token != null) {
            try {
                var email = tokenService.validarToken(token);
                var usuario = usuarioRepository.findByEmail(email);

                if (usuario.isPresent()) {
                    var auth = new UsernamePasswordAuthenticationToken(usuario.get(), null, usuario.get().getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
           } catch (Exception e) {
             // Token inválido ou expirado
           }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.replace("Bearer ", "");
    }
}
