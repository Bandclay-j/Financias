package com.financeiro.planilha_financeira.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.financeiro.planilha_financeira.model.TipoTransacao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DadosCadastroTransacao(
    @NotBlank(message = "A descrição é obrigatória")
    String descricao,

    @NotNull(message = "O valor é obrigatório")
    @Positive(message = "O valor deve ser maior que zero")
    BigDecimal valor,

    @NotNull(message = "A data é obrigatória")
    LocalDate data,

    @NotNull(message = "O tipo é obrigatório")
    TipoTransacao tipo,

    @NotBlank(message = "A categoria é obrigatória")
    String categoria,

    @NotBlank(message = "A conta é obrigatória")
    String conta
) {}
