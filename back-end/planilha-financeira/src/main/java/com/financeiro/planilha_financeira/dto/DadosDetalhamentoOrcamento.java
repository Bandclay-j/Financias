package com.financeiro.planilha_financeira.dto;

import java.math.BigDecimal;

import com.financeiro.planilha_financeira.model.Orcamento;

public record DadosDetalhamentoOrcamento(Long id, String categoria, BigDecimal limite, String mes) {
    public DadosDetalhamentoOrcamento(Orcamento o) {
        this(o.getId(), o.getCategoria(), o.getLimite(), o.getMes());
    }    
}
