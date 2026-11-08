package com.financeiro.planilha_financeira.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name= "metas_financeiras")
@Getter 
@Setter 
@NoArgsConstructor 
public class MetaFinanceira {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable= false, length= 100)
    private String nome;

    @Column(name= "valor_alvo", nullable= false, precision= 12, scale= 2)
    private BigDecimal valorAlvo;

    @Column(name= "valor_atual", nullable= false, precision= 12, scale= 2)
    private BigDecimal valorAtual = BigDecimal.ZERO;

    private LocalDate prazo;

    @ManyToOne(fetch= FetchType.LAZY, optional= false)
    @JoinColumn(name= "usuario_id", nullable= false)
    private Usuario usuario;

    public String getNome() {
        return nome;
    }

   public void setNome(String nome) {
        this.nome = nome;
   }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getValorAlvo() {
        return valorAlvo;
    }

    public void setValorAlvo(BigDecimal valorAlvo) {
        this.valorAlvo = valorAlvo;
    }

    public BigDecimal getValorAtual() {
        return valorAtual;
    }

    public void setValorAtual(BigDecimal valorAtual) {
        this.valorAtual = valorAtual;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    public void setPrazo(LocalDate prazo) {
        this.prazo = prazo;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
