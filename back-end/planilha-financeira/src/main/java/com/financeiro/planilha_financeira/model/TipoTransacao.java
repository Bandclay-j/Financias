package com.financeiro.planilha_financeira.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoTransacao {
    ENTRADA("entrada"),
    SAIDA("saída");

    private final String descricao;

    TipoTransacao(String descricao) {
        this.descricao = descricao;
    }

    @JsonValue
    public String getDescricao() {
        return descricao;
    }

    @JsonCreator
    public static TipoTransacao doTexto(String texto) {
        if (texto == null) return null;
        for (TipoTransacao t : values()) {
            if (t.name().equalsIgnoreCase(texto) ||
                t.descricao.equalsIgnoreCase(texto) ||
                (t == SAIDA && texto.equalsIgnoreCase("saida"))) {
                    return t;
            }
        }
        throw new IllegalArgumentException("Tipo de transacao inválido: " + texto);
    }
}
