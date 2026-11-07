package com.financeiro.planilha_financeira.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record DadosCadastroMeta(
    @NotBlank(message= "O nome da meta é obrigatório")
    @Size(max= 100, message= "O nome deve ter no máximo 100 caracteres")
    String nome,

    @NotNull(message= "O valor alvo é obrigatório")
    @Positive(message= "O valor alvo deve ser maior que zero")
    BigDecimal valorAlvo,

    @NotNull(message= "O valor atual é obrigatório")
    @PositiveOrZero(message= "O valor atual não pode ser negativo")
    BigDecimal valorAtual,

    LocalDate prazo
) {}
