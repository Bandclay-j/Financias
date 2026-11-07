package com.financeiro.planilha_financeira.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.financeiro.planilha_financeira.model.MetaFinanceira;

public record DadosDetalhamentoMeta(
    Long id, String nome, BigDecimal valorAlvo, BigDecimal valorAtual, LocalDate prazo
) {
    public DadosDetalhamentoMeta(MetaFinanceira m) {
        this(m.getId(), m.getNome(), m.getValorAlvo(), m.getValorAtual(), m.getPrazo());
    }
}
