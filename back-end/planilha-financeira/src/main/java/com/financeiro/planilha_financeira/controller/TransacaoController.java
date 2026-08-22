package com.financeiro.planilha_financeira.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financeiro.planilha_financeira.model.Transacao;
import com.financeiro.planilha_financeira.repository.TransacaoRepository;

@RestController
@RequestMapping("/api/transacoes")
@CrossOrigin(origins = "*") // Permite chamadas do frontend no navegador
public class TransacaoController {

    @Autowired
    private TransacaoRepository repository;

    @GetMapping("/usuario/{usuarioId}")
    public List<Transacao> listarPorUsuario(@PathVariable Long usuarioId) {
        return repository.findByUsuarioId(usuarioId);
    }

    @PostMapping
    public Transacao salvar(@RequestBody Transacao transacao) {
        return repository.save(transacao);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
