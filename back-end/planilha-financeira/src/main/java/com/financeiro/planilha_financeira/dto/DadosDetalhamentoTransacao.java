package com.financeiro.planilha_financeira.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.financeiro.planilha_financeira.model.Transacao;

public record DadosDetalhamentoTransacao(Long id, String descricao, BigDecimal valor, LocalDate data, String tipo, String categoria, Long usuarioId) {
    public DadosDetalhamentoTransacao(Transacao transacao) {
        this(
            transacao.getId(),
            transacao.getDescricao(),
            transacao.getValor(),
            transacao.getData(),
            transacao.getTipo(),
            transacao.getCategoria(),
            transacao.getUsuario() != null ? transacao.getUsuario().getId() : null
        );
    }
}
