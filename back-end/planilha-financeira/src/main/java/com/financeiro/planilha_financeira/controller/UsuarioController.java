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

import com.financeiro.planilha_financeira.dto.DadosCadastroUsuario;
import com.financeiro.planilha_financeira.dto.DadosDetalhamentoUsuario;
import com.financeiro.planilha_financeira.dto.DadosLogin;
import com.financeiro.planilha_financeira.dto.DadosTokenJWT;
import com.financeiro.planilha_financeira.model.Usuario;
import com.financeiro.planilha_financeira.repository.UsuarioRepository;
import com.financeiro.planilha_financeira.security.TokenService;

import jakarta.validation.Valid;

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
    public ResponseEntity<?> cadastrar(@RequestBody @Valid DadosCadastroUsuario dados) {
        if (repository.findByEmail(dados.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email já cadastrado!");
        }

        var usuario = new Usuario();
        usuario.setNome(dados.nome());
        usuario.setEmail(dados.email());
        usuario.setSenha(passwordEncoder.encode(dados.senha()));

        var salvo = repository.save(usuario);
        return ResponseEntity.ok(new DadosDetalhamentoUsuario(salvo));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid DadosLogin dados) {
        Optional<Usuario> userBD = repository.findByEmail(dados.email());

        if (userBD.isPresent() && passwordEncoder.matches(dados.senha(), userBD.get().getSenha())) {
            String token = tokenService.gerarToken(userBD.get().getEmail());
            var detalhamento = new DadosDetalhamentoUsuario(userBD.get());
            return ResponseEntity.ok(new DadosTokenJWT(token, detalhamento));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou senha incorretos!");
    }
}
