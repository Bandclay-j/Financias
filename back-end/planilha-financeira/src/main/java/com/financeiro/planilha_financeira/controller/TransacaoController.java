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

import com.financeiro.planilha_financeira.model.Transacao;
import com.financeiro.planilha_financeira.repository.TransacaoRepository;

@RestController
@RequestMapping("/api/transacoes")
@CrossOrigin(origins = "*") // Permite chamadas do frontend no navegador
public class TransacaoController {

    @Autowired
    private TransacaoRepository transacaoRepository;

    @GetMapping
    public List<Transacao> listarTodas() {
        return transacaoRepository.findAll();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Transacao> listarPorUsuario(@PathVariable Long usuarioId) {
        return transacaoRepository.findByUsuarioId(usuarioId);
    }

    @PostMapping
    public Transacao criarTransacao(@RequestBody Transacao transacao) {
        return transacaoRepository.save(transacao);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transacao> atualizarTransacao(@PathVariable Long id, @RequestBody Transacao transacaoAtualizada) {
        return transacaoRepository.findById(id)
            .map(transacaoExistente -> {
                transacaoExistente.setDescricao(transacaoAtualizada.getDescricao());
                transacaoExistente.setValor(transacaoAtualizada.getValor());
                transacaoExistente.setData(transacaoAtualizada.getData());
                transacaoExistente.setTipo(transacaoAtualizada.getTipo());
                transacaoExistente.setCategoria(transacaoAtualizada.getCategoria());

                Transacao salva = transacaoRepository.save(transacaoExistente);
                return ResponseEntity.ok(salva);
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
