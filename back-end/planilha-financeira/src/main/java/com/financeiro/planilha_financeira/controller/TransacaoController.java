package com.financeiro.planilha_financeira.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import com.financeiro.planilha_financeira.model.Transacao;
import com.financeiro.planilha_financeira.repository.TransacaoRepository;
import com.financeiro.planilha_financeira.dto.*;
import com.financeiro.planilha_financeira.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/transacoes")
@CrossOrigin(origins = "*") // Permite chamadas do frontend no navegador
public class TransacaoController {

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<DadosDetalhamentoTransacao> listarTodas() {
        return transacaoRepository.findAll().stream()
            .map(DadosDetalhamentoTransacao::new)
            .toList();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<DadosDetalhamentoTransacao> listarPorUsuario(@PathVariable Long usuarioId) {
        return transacaoRepository.findByUsuarioId(usuarioId).stream()
            .map(DadosDetalhamentoTransacao::new)
            .toList();
    }

    @PostMapping
    public ResponseEntity<?> criarTransacao(@RequestBody @Valid DadosCadastroTransacao dados) {
        var usuarioOpt = usuarioRepository.findById(dados.usuarioId());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado!");
        }

        var transacao = new Transacao();
        transacao.setDescricao(dados.descricao());
        transacao.setValor(dados.valor());
        transacao.setData(dados.data());
        transacao.setTipo(dados.tipo());
        transacao.setCategoria(dados.categoria());
        transacao.setUsuario(usuarioOpt.get());

        var salva = transacaoRepository.save(transacao);
        return ResponseEntity.ok(new DadosDetalhamentoTransacao(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DadosDetalhamentoTransacao> atualizarTransacao(@PathVariable Long id, @RequestBody @Valid DadosCadastroTransacao dados) {
        return transacaoRepository.findById(id)
            .map(transacaoExistente -> {
                transacaoExistente.setDescricao(dados.descricao());
                transacaoExistente.setValor(dados.valor());
                transacaoExistente.setData(dados.data());
                transacaoExistente.setTipo(dados.tipo());
                transacaoExistente.setCategoria(dados.categoria());

                Transacao salva = transacaoRepository.save(transacaoExistente);
                return ResponseEntity.ok(new DadosDetalhamentoTransacao(salva));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTransacao(@PathVariable Long id) {
        if (transacaoRepository.existsById(id)) {
            transacaoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
