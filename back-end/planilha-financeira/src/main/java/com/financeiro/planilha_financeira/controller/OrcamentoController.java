package com.financeiro.planilha_financeira.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.financeiro.planilha_financeira.dto.DadosCadastroOrcamento;
import com.financeiro.planilha_financeira.dto.DadosDetalhamentoOrcamento;
import com.financeiro.planilha_financeira.model.Usuario;
import com.financeiro.planilha_financeira.service.OrcamentoService;

import jakarta.validation.Valid;

@RestController 
@RequestMapping("/api/orcamentos")
public class OrcamentoController {
    private final OrcamentoService service;

    public OrcamentoController(OrcamentoService service) {
        this.service = service;
    }

    @GetMapping 
    public ResponseEntity<List<DadosDetalhamentoOrcamento>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.listar(usuario));
    }

    @PostMapping
    public ResponseEntity<DadosDetalhamentoOrcamento> criar(@RequestBody @Valid DadosCadastroOrcamento dados, @AuthenticationPrincipal Usuario usuario, UriComponentsBuilder uriBuilder) {
        DadosDetalhamentoOrcamento salvo = service.criar(dados,usuario);
        URI uri = uriBuilder.path("/api/orcamentos/{id}").buildAndExpand(salvo.id()).toUri();
        return ResponseEntity.created(uri).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DadosDetalhamentoOrcamento> atualizar(@PathVariable Long id, @RequestBody @Valid DadosCadastroOrcamento dados, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.atualizar(id, dados, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        service.excluir(id, usuario);
        return ResponseEntity.noContent().build();
    }
}
