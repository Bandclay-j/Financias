package com.financeiro.planilha_financeira.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "transacoes")
@Data
public class Transacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descricao;
    private BigDecimal valor;
    private String tipo; // "entrada" ou "saída"
    private String categoria;
    private LocalDate data;
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

}