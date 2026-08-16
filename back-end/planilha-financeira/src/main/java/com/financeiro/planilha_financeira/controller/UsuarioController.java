package com.financeiro.planilha_financeira.controller;

import com.financeiro.planilha_financeira.model.Usuario;
import com.financeiro.planilha_financeira.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @PostMapping("/cadastrar")
    public Usuario cadastrar(@RequestBody Usuario usuario) {
        return repository.save(usuario);
    }

    @PostMapping("/login")
    public Usuario login(@RequestBody Usuario usuario) {
        Optional<Usuario> userBD = repository.findByEmail(usuario.getEmail());
        if (userBD.isPresent() && userBD.get().getSenha().equals(usuario.getSenha())) {
            return userBD.get();
        }
        throw new RuntimeException("Email ou senha inválidos!");
    }
}
