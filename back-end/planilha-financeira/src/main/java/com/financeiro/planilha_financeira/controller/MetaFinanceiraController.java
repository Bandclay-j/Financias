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
import com.financeiro.planilha_financeira.dto.DadosCadastroMeta;
import com.financeiro.planilha_financeira.dto.DadosDetalhamentoMeta;
import com.financeiro.planilha_financeira.model.Usuario;
import com.financeiro.planilha_financeira.service.MetaFinanceiraService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/metas")
public class MetaFinanceiraController {
    private final MetaFinanceiraService service;

    public MetaFinanceiraController(MetaFinanceiraService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoMeta>> listar(
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.listar(usuario));
    }

    @PostMapping
    public ResponseEntity<DadosDetalhamentoMeta> criar(
            @RequestBody @Valid DadosCadastroMeta dados,
            @AuthenticationPrincipal Usuario usuario,
            UriComponentsBuilder uriBuilder) {
        DadosDetalhamentoMeta salva = service.criar(dados, usuario);
        URI uri = uriBuilder.path("/api/metas/{id}").buildAndExpand(salva.id()).toUri();
        return ResponseEntity.created(uri).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DadosDetalhamentoMeta> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid DadosCadastroMeta dados,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.atualizar(id, dados, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        service.excluir(id, usuario);
        return ResponseEntity.noContent().build();
    }
}