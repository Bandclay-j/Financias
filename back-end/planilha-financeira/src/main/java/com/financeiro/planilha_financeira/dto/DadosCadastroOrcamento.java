package com.financeiro.planilha_financeira.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record DadosCadastroOrcamento(
    @NotBlank(message= "A categoria é obrigatória")
    @Size(max= 80, message= "A categoria deve ter no máximo 80 caracteres")
    String categoria,

    @NotNull(message= "O limite é obrigatório")
    @Positive(message= "O limite deve ser maior que zero")
    BigDecimal limite,

    @NotBlank(message= "O mês é obrigatório")
    @Pattern(regexp= "^\\d{4}-(0[1-9]|1[0-2])$", message= "O mês deve estar no formato YYYY-MM")
    String mes
) {}