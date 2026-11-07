package com.financeiro.planilha_financeira.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.financeiro.planilha_financeira.model.Orcamento;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
    List<Orcamento> findAllByUsuarioIdOrderByMesDescCategoriaAsc(Long usuarioId);
    Optional<Orcamento> findByIdAndUsuarioId(Long id, Long usuarioId);
    boolean existsByUsuarioIdAndCategoriaIgnoreCaseAndMes(Long usuarioId, String categoria, String mes);
}