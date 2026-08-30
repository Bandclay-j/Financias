package com.financeiro.planilha_financeira.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.financeiro.planilha_financeira.dto.DadosCadastroTransacao;
import com.financeiro.planilha_financeira.dto.DadosDetalhamentoTransacao;
import com.financeiro.planilha_financeira.model.Transacao;
import com.financeiro.planilha_financeira.model.Usuario;
import com.financeiro.planilha_financeira.repository.TransacaoRepository;

@Service
public class TransacaoService {
    
    @Autowired
    private TransacaoRepository transacaoRepository;

    public List<DadosDetalhamentoTransacao> listarPorUsuario(Usuario usuario) {
        return transacaoRepository.findByUsuarioId(usuario.getId()).stream()
            .map(DadosDetalhamentoTransacao::new)
            .toList();
    }

    public Transacao criar(DadosCadastroTransacao dados, Usuario usuario) {
        var transacao = new Transacao();
        transacao.setDescricao(dados.descricao());
        transacao.setValor(dados.valor());
        transacao.setData(dados.data());
        transacao.setTipo(dados.tipo());
        transacao.setCategoria(dados.categoria());
        transacao.setConta(dados.conta());
        transacao.setUsuario(usuario);

        return transacaoRepository.save(transacao);
    }

    public DadosDetalhamentoTransacao atualizar(Long id, DadosCadastroTransacao dados, Usuario usuario) {
        return transacaoRepository.findById(id)
            .filter(t -> t.getUsuario().getId().equals(usuario.getId()))
            .map(transacaoExistente -> {
                transacaoExistente.setDescricao(dados.descricao());
                transacaoExistente.setValor(dados.valor());
                transacaoExistente.setData(dados.data());
                transacaoExistente.setTipo(dados.tipo());
                transacaoExistente.setCategoria(dados.categoria());
                transacaoExistente.setConta(dados.conta());

                Transacao salva = transacaoRepository.save(transacaoExistente);
                return new DadosDetalhamentoTransacao(salva);
            })
            .orElse(null);
    }

    public boolean deletar(Long id, Usuario usuario) {
        return transacaoRepository.findById(id)
            .filter(t -> t.getUsuario().getId().equals(usuario.getId()))
            .map(t -> {
                transacaoRepository.delete(t);
                return true;
            })
            .orElse(false);
    }
}
