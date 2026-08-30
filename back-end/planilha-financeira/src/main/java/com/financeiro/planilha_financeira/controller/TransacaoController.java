package com.financeiro.planilha_financeira.controller;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.financeiro.planilha_financeira.dto.DadosCadastroTransacao;
import com.financeiro.planilha_financeira.dto.DadosDetalhamentoTransacao;
import com.financeiro.planilha_financeira.model.Usuario;
import com.financeiro.planilha_financeira.service.TransacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transacoes")
@CrossOrigin(origins = "*") // Permite chamadas do frontend no navegador
public class TransacaoController {

    @Autowired
    private TransacaoService transacaoService;

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoTransacao>> listarMinhasTransacoes(@AuthenticationPrincipal Usuario usuarioLogado) {
        List<DadosDetalhamentoTransacao> transacoes = transacaoService.listarPorUsuario(usuarioLogado);
        return ResponseEntity.ok(transacoes);
    }
    
    @PostMapping
    public ResponseEntity<DadosDetalhamentoTransacao> criarTransacao(
        @RequestBody @Valid DadosCadastroTransacao dados,
        @AuthenticationPrincipal Usuario usuarioLogado,
        UriComponentsBuilder uriBuilder) {

            var salva = transacaoService.criar(dados, usuarioLogado);
            URI uri = uriBuilder.path("/api/transacoes/{id}").buildAndExpand(salva.getId()).toUri();
            return ResponseEntity.created(uri).body(new DadosDetalhamentoTransacao(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DadosDetalhamentoTransacao> atualizarTransacao(
        @PathVariable Long id,
        @RequestBody @Valid DadosCadastroTransacao dados,
        @AuthenticationPrincipal Usuario usuarioLogado) {

            DadosDetalhamentoTransacao atualizada = transacaoService.atualizar(id, dados, usuarioLogado);
            if (atualizada == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(atualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTransacao(
        @PathVariable Long id,
        @AuthenticationPrincipal Usuario usuarioLogado) {

            boolean deletado = transacaoService.deletar(id, usuarioLogado);
            if(!deletado) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.noContent().build();
    }
}
