package com.financeiro.planilha_financeira.dto;

import com.financeiro.planilha_financeira.model.Usuario;

public record DadosDetalhamentoUsuario(Long id, String nome, String email) {
    public DadosDetalhamentoUsuario(Usuario usuario) {
        this(usuario.getId(), usuario.getNome(), usuario.getEmail());
    }
}
