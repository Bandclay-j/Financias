package com.financeiro.planilha_financeira.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financeiro.planilha_financeira.model.Usuario;
import com.financeiro.planilha_financeira.repository.UsuarioRepository;
import com.financeiro.planilha_financeira.security.TokenService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody Usuario usuario) {
        if (repository.findByEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email já cadastrado!");
        }
        // Criptografa a senha antes de salvar
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return ResponseEntity.ok(repository.save(usuario));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        Optional<Usuario> userBD = repository.findByEmail(usuario.getEmail());

        if (userBD.isPresent() && passwordEncoder.matches(usuario.getSenha(), userBD.get().getSenha())) {
            // Gera o Token JWT válido
            String token = tokenService.gerarToken(userBD.get().getEmail());

            // Retorna o token e os dados do usuário para o front-end
            return ResponseEntity.ok(Map.of(
                "token", token,
                "usuario", Map.of(
                    "id", userBD.get().getId(),
                    "nome", userBD.get().getNome(),
                    "email", userBD.get().getEmail()
                )
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou senha incorretos!");
    }
}
