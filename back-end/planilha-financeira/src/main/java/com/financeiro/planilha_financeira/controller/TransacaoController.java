package com.financeiro.planilha_financeira.controller;

import com.financeiro.planilha_financeira.model.Transacao;
import com.financeiro.planilha_financeira.repository.TransacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
@CrossOrigin(origins = "*") // Permite chamadas do frontend no navegador
public class TransacaoController {
    
    @Autowired
    private TransacaoRepository repository;

    @GetMapping
    public List<Transacao> listarTodas() {
        return repository.findAll();
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
