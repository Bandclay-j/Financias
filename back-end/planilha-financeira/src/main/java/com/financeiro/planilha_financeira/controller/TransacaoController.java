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
import com.financeiro.planilha_financeira.model.Transacao;
import com.financeiro.planilha_financeira.model.Usuario;
import com.financeiro.planilha_financeira.repository.TransacaoRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transacoes")
@CrossOrigin(origins = "*") // Permite chamadas do frontend no navegador
public class TransacaoController {

    @Autowired
    private TransacaoRepository transacaoRepository;


    @GetMapping
    public List<DadosDetalhamentoTransacao> listarMinhasTransacoes(@AuthenticationPrincipal Usuario usuarioLogado) {
        return transacaoRepository.findByUsuarioId(usuarioLogado.getId()).stream()
            .map(DadosDetalhamentoTransacao::new)
            .toList();
    }

    @PostMapping
    public ResponseEntity<DadosDetalhamentoTransacao> criarTransacao(@RequestBody @Valid DadosCadastroTransacao dados, @AuthenticationPrincipal Usuario usuarioLogado, UriComponentsBuilder uriBuilder) {

        var transacao = new Transacao();
        transacao.setDescricao(dados.descricao());
        transacao.setValor(dados.valor());
        transacao.setData(dados.data());
        transacao.setTipo(dados.tipo());
        transacao.setCategoria(dados.categoria());
        transacao.setConta(dados.conta());
        transacao.setUsuario(usuarioLogado);

        var salva = transacaoRepository.save(transacao);
        URI uri = uriBuilder.path("/api/transacoes/${id}").buildAndExpand(salva.getId()).toUri();
        return ResponseEntity.created(uri).body(new DadosDetalhamentoTransacao(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DadosDetalhamentoTransacao> atualizarTransacao(@PathVariable Long id, @RequestBody @Valid DadosCadastroTransacao dados, @AuthenticationPrincipal Usuario usuarioLogado) {
        return transacaoRepository.findById(id)
        .filter(t -> t.getUsuario().getId().equals(usuarioLogado.getId()))
            .map(transacaoExistente -> {
                transacaoExistente.setDescricao(dados.descricao());
                transacaoExistente.setValor(dados.valor());
                transacaoExistente.setData(dados.data());
                transacaoExistente.setTipo(dados.tipo());
                transacaoExistente.setCategoria(dados.categoria());
                transacaoExistente.setConta(dados.conta());

                Transacao salva = transacaoRepository.save(transacaoExistente);
                return ResponseEntity.ok(new DadosDetalhamentoTransacao(salva));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTransacao(
        @PathVariable Long id, 
        @AuthenticationPrincipal Usuario usuarioLogado) {

       return transacaoRepository.findById(id)
        .filter(t -> t.getUsuario().getId().equals(usuarioLogado.getId()))
        .map(t -> {
            transacaoRepository.delete(t);
            return ResponseEntity.noContent().<Void>build();
        })
        .orElse(ResponseEntity.notFound().build());
    }
}
